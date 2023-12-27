import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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
 * /posts/:postId/comments/:commentId/replies:
 *   post:
 *     summary: 대댓글 작성
 *     description: 특정 댓글에 대한 대댓글을 작성한다.
 *     tags:
 *       - Replies
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
 *         description: 대댓글을 작성할 댓글의 고유 식별자
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 대댓글 내용
 *     responses:
 *       200:
 *         description: 성공적으로 대댓글을 작성한 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     replyId:
 *                       type: integer
 *                       description: 작성된 대댓글의 고유 식별자
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
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */

router.post(
  "/posts/:postId/comments/:commentId/replies",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId, commentId } = req.params;
      const { content } = req.body;

      const posts = await prisma.posts.findFirst({
        where: { postId: +postId },
      });
      if (!posts) {
        return res
          .status(404)
          .json({ message: "이미 삭제되었거나, 변경된 댓글 입니다." });
      }

      const comments = await prisma.comments.findFirst({
        where: { commentId: +commentId, PostId: +postId },
      });
      if (!comments) {
        return res
          .status(404)
          .json({ message: "이미 삭제되었거나, 변경된 댓글 입니다." });
      }

      const reply = await prisma.replies.create({
        data: {
          UserId: userId,
          CommentId: +commentId,
          content: content,
        },
      });

      await prisma.comments.update({
        where: { commentId: +commentId },
        data: {
          replyCount: {
            increment: 1,
          },
        },
      });

      return res.status(200).json({ data: reply });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /posts/:postId/comments/:commentId/replies:
 *   get:
 *     summary: 대댓글 목록 조회
 *     description: 특정 댓글에 대한 대댓글 목록을 조회한다.
 *     tags:
 *       - Replies
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
 *         description: 대댓글을 조회할 댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 성공적으로 대댓글 목록을 조회한 경우
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
 *                       replyId:
 *                         type: integer
 *                         description: 대댓글의 고유 식별자
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 대댓글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 대댓글 작성자의 프로필 이미지 URL
 *                       Comment:
 *                         type: object
 *                         properties:
 *                           commentId:
 *                             type: integer
 *                             description: 댓글의 고유 식별자
 *                           content:
 *                             type: string
 *                             description: 댓글 내용
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 댓글 작성 일자
 *                       content:
 *                         type: string
 *                         description: 대댓글 내용
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 대댓글 작성 일자
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
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */

router.get(
  "/posts/:postId/comments/:commentId/replies",
  async (req, res, next) => {
    try {
      const { commentId } = req.params;

      const comment = await prisma.comments.findFirst({
        where: { commentId: +commentId },
      });
      if (!comment) {
        return res
          .status(404)
          .json({ meesage: "이미 삭제되었거나, 없는 댓글입니다." });
      }

      const reply = await prisma.replies.findMany({
        where: { CommentId: +commentId },
        select: {
          User: {
            select: {
              nickname: true,
              imgUrl: true,
            },
          },
          Comment: {
            select: {
              commentId: true,
              content: true,
              createdAt: true,
            },
          },
          replyId: true,
          content: true,
          createdAt: true,
        },
      });
      const replysWithImages = await Promise.all(
        reply.map(async (reply) => {
          if (reply.User.imgUrl && reply.User.imgUrl.length === 64) {
            const getObjectParams = {
              Bucket: bucketName, // 버킷 이름
              Key: reply.User.imgUrl, // 이미지 키
            };

            // GetObjectCommand를 사용하여 이미지 URL을 생성
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command);

            // 불러온 이미지 URL로 대체
            reply.User.imgUrl = url;
          }
        }),
      );

      return res.status(200).json({ data: reply });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /posts/:postId/comments/:commentId/replies/replyId:
 *   delete:
 *     summary: 대댓글 삭제
 *     description: 특정 댓글의 대댓글을 삭제한다.
 *     tags:
 *       - Replies
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글이 속한 게시글의 고유 식별자
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 대댓글이 속한 댓글의 고유 식별자
 *       - in: path
 *         name: replyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 대댓글의 고유 식별자
 *     responses:
 *       200:
 *         description: 대댓글이 성공적으로 삭제된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     replyId:
 *                       type: integer
 *                       description: 삭제된 대댓글의 고유 식별자
 *       404:
 *         description: 대댓글이나 댓글, 게시글이 존재하지 않는 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: "대댓글을 찾을 수 없습니다."
 *       500:
 *         description: 서버에서 에러가 발생했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                   type: string
 *                   example: 서버에서 에러가 발생하였습니다.
 */

router.delete(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { replyId, commentId } = req.params;

      await prisma.$transaction(async (prisma) => {
        const reply = await prisma.replies.findFirst({
          where: { replyId: +replyId },
        });

        if (!reply) {
          return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
        }

        const deleteReply = await prisma.replies.delete({
          where: {
            UserId: userId,
            CommentId: +commentId,
            replyId: +replyId,
          },
        });

        if (!deleteReply) {
          return res.status(403).json({ message: "삭제할 권한이 없습니다." });
        }

        // 대댓글 수량 업데이트 -1
        await prisma.comments.update({
          where: { commentId: +commentId },
          data: {
            replyCount: {
              decrement: 1,
            },
          },
        });
      });

      return res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
