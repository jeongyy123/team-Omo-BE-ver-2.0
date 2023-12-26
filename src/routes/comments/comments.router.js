import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import multer from "multer";
import crypto from "crypto";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { getProfileImageS3 } from "../../utils/getImageS3.js";

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
            increment: 1
          }
         },
      })

      if (!comment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글을 등록할 권한이 없습니다." });
      }
      return res.status(200).json({ data: comment });
    } catch (error) {
      next(error);
    }
  },
);

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
        .json({ errorMessage: "존재하지 않는 게시글 입니다." });
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

    // const commentImgUrl = await getProfileImageS3(comment)
    // comment.User.imgUrl = url
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

  })
);
    return res.status(200).json({ data: comment });
  } catch (error) {
    next(error);
  }
});

// comment DELETE API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res, next) => {
    try {

    const { userId } = req.user;
    const { commentId, postId } = req.params;

    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });
    // await prisma.$transaction( async (prisma) => {
      const deleteComment = await prisma.comments.delete({
        where: { UserId: userId, commentId: +commentId },
      }); 
      // 댓글 수량 업데이트
      await prisma.posts.update({
        where: { postId: +postId },
        data: { 
          commentCount: {
            decrement: 1
          }
         },
      });
      
    // })

    return res.status(200).json({ data: deleteComment });
  }catch (error) {
    next(error)
    // throw new Error ("댓글 작성에 실패 하였습니다.")
  }
});

export default router;
