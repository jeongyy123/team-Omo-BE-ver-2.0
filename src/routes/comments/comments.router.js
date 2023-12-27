import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import crypto from "crypto";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

// To get a complately unique name
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const imageName = randomImageName(); // file name will be random

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: bucketRegion,
});

const router = express.Router();

/**
 * @swagger
 * /posts/:postId/comments:
 *   post:
 *     summary: 댓글 등록
 *     description: 특정 게시글에 댓글을 등록한다.
 *     tags:
 *      - Comments
 *     security:
 *       - bearerAuth: []  # JWT Bearer Token을 필요로 함
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글을 등록할 게시글의 고유 식별자
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 등록할 댓글의 내용
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 등록한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     UserId:
 *                       type: number
 *                       description: 댓글 작성자의 고유 식별자
 *                     PostId:
 *                       type: number
 *                       description: 댓글이 속한 게시글의 고유 식별자
 *                     content:
 *                       type: string
 *                       description: 댓글 내용
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 댓글 작성 날짜
 *       400:
 *         description: 요청이 잘못된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "댓글을 등록할 권한이 없습니다."
 *       401:
 *         description: 인증이 실패한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "게시글을 찾을 수 없습니다."
 *       500:
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

// comment POST API
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;
      const { content } = req.body;

      const post = await prisma.posts.findFirst({
        where: { postId: +postId },
      });

      const comment = await prisma.comments.create({
        data: {
          UserId: userId,
          PostId: +postId,
          content: content,
        },
      });
      // commentCount
      await prisma.posts.update({
        where: { postId: +postId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      });

      if (!comment) {
        return res
          .status(403)
          .json({ errorMessage: "댓글을 등록할 권한이 없습니다." });
      }
      return res.status(200).json({ data: comment });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /posts/:postId/comments:
 *   get:
 *     summary: 댓글 조회
 *     description: 특정 게시글의 댓글을 조회한다.
 *     tags:
 *      - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글을 조회할 게시글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 조회한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 댓글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 댓글 작성자의 이미지 URL
 *                       Post:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: integer
 *                             description: 게시글의 고유 식별자
 *                       commentId:
 *                         type: integer
 *                         description: 댓글의 고유 식별자
 *                       content:
 *                         type: string
 *                         description: 댓글 내용
 *                       replyCount:
 *                         type: integer
 *                         description: 댓글에 대한 답글 수
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 댓글 작성 날짜
 *       404:
 *         description: 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "게시글을 찾을 수 없습니다."
 *       500:
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

// comment GET API
router.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "이미 삭제되었거나, 없는 댓글입니다." });
    }

    // 댓글 전부 조회
    const comment = await prisma.comments.findMany({
      where: { PostId: +postId },
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true,
          },
        },
        Post: {
          select: {
            postId: true,
          },
        },
        commentId: true,
        content: true,
        replyCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 각 댓글의 사용자 이미지를 S3에서 불러오기
    const commentsWithImages = await Promise.all(
      comment.map(async (comment) => {
        if (comment.User.imgUrl && comment.User.imgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName, // 버킷 이름
            Key: comment.User.imgUrl, // 이미지 키
          };

          // GetObjectCommand를 사용하여 이미지 URL을 생성
          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command);

          // 불러온 이미지 URL로 대체
          comment.User.imgUrl = url;
        }
      }),
    );
    return res.status(200).json({ data: comment });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /posts/:postId/comments/:commentId:
 *   delete:
 *     summary: 댓글 삭제
 *     description: 특정 게시글의 댓글을 삭제한다.
 *     tags:
 *      - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 댓글이 속한 게시글의 고유 식별자
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 삭제한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: integer
 *                       description: 삭제된 댓글의 고유 식별자
 *       404:
 *         description: 댓글이나 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "댓글을 찾을 수 없습니다."
 *       500:
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

// comment DELETE API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { commentId, postId } = req.params;

      await prisma.$transaction(async (prisma) => {
        const comment = await prisma.comments.findFirst({
          where: { commentId: +commentId },
        });

        if (!comment) {
          return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
        }

        const deleteComment = await prisma.comments.delete({
          where: { UserId: userId, commentId: +commentId },
        });

        if (!deleteComment) {
          return res.status(403).json({ message: "삭제할 권한이 없습니다." });
        }

        // 댓글 수량 업데이트 -1
        await prisma.posts.update({
          where: { postId: +postId },
          data: {
            commentCount: {
              decrement: 1,
            },
          },
        });

        return res.status(200).json({ message: "댓글이 삭제되었습니다." });
      });
    } catch (error) {
      next(error);
      throw new Error("댓글 삭제에 실패 하였습니다.");
    }
  },
);

export default router;
