import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import crypto from "crypto";
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

      const comments = await prisma.comments.findFirst({
        where: { commentId: +commentId, PostId: +postId },
      });

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
      // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
      if (reply.imgUrl && reply.imgUrl.length === 64) {
        const getObjectParams = {
          Bucket: bucketName, // 버킷 이름
          Key: reply.imgUrl, // 이미지 키
        };

        // User GetObjectCommand to create the url
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command);
        reply.imgUrl = url;
      } else {
        const defaultImageUrl =
          "https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w240-h480-rw";

        reply.imgUrl = defaultImageUrl;
      }

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

      await prisma.$transaction(async (prisma) => {
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
      });

      return res.status(200).json({ data: deleteReply });
    } catch (error) {
      next(error);
      throw new Error("대댓글 작성을 실패 하였습니다.");
    }
  },
);

export default router;
