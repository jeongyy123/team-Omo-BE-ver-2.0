import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import multer from "multer";
import crypto from "crypto";
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

// 매모리 저장 객체 생성
const storage = multer.memoryStorage();
// multer로 업로드 기능을 생성. 항상 이미지를 메모리에 저장하도록 하기 위함이다.
const upload = multer({ storage: storage, fileFilter });

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

    // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
    if (post.imgUrl && post.imgUrl.length === 64) {
      const getObjectParams = {

        Bucket: bucketName, // 버킷 이름
        Key: post.imgUrl, // 이미지 키
      };

      // User GetObjectCommand to create the url
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command);
      post.imgUrl = url;
    } else {
      const defaultImageUrl =
        "https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w240-h480-rw";

      post.imgUrl = defaultImageUrl;
    }
    // post.imgUrl = decodeURIComponent(url);

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
