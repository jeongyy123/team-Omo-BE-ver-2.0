import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import crypto from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// dotenv.config();

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
        return res.status(404).json({ message: "이미 삭제되었거나, 변경된 댓글 입니다."})
      }

      const comments = await prisma.comments.findFirst({
        where: { commentId: +commentId, PostId: +postId },
      });
      if (!comments) {
        return res.status(404).json({ message: "이미 삭제되었거나, 변경된 댓글 입니다."})
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
          .json({ meesage: "이미 삭제되었거나, 변경된 댓글 입니다." });
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
      
        })
      );

      return res.status(200).json({ data: reply });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { replyId, commentId } = req.params;

      const reply = await prisma.replies.findFirst({
        where: { replyId: +replyId },
      });

      // await prisma.$transaction(async (prisma) => {
        const deleteReply = await prisma.replies.delete({
          where: {
            UserId: userId,
            CommentId: +commentId,
            replyId: +replyId,
          },
        });

        // 대댓글 수량 업데이트
        await prisma.comments.update({
          where: { commentId: +commentId },
          data: {
            replyCount: {
              decrement: 1,
            },
          },
        });
      // });

      return res.status(200).json({ data: deleteReply });
    } catch (error) {
      next(error);
      // throw new Error("대댓글 작성을 실패 하였습니다.");
    }
  },
);

export default router;
