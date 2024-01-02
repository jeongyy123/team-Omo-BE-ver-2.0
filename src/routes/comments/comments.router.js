import express from "express";
import { CommentsController } from "../../controllers/comments.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
// import { prisma } from "../../utils/prisma/index.js";
// import crypto from "crypto";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { createCommentsSchema } from "../../validations/comments.validation.js";
// import dotenv from "dotenv";
// import { CommentsController } from "../../../services/comments.service.js";

// dotenv.config();

// // To get a complately unique name
// const randomImageName = (bytes = 32) =>
//   crypto.randomBytes(bytes).toString("hex");

// const imageName = randomImageName(); // file name will be random

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION;
// const accessKey = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   },
//   region: bucketRegion,
// });

const router = express.Router();
const commentsController = new CommentsController();

// 등록 api
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  commentsController.createComment,
);

// 조회 api
router.get("/posts/:postId/comments", commentsController.getComments);

// 삭제 api
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  commentsController.deleteComment,
);


// comment POST API
// router.post(
//   "/posts/:postId/comments",
//   authMiddleware,
//   async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       const { postId } = req.params;

//       if (!userId) {
//         return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
//       }

//       const validation = await createCommentsSchema.validateAsync(req.body);
//       const { content } = validation;

//       console.log("validation>>>>>>>", validation);

//       const post = await prisma.posts.findFirst({
//         where: { postId: +postId },
//       });

//       console.log("post>>>>>>.", post);
//       const comment = await prisma.comments.create({
//         data: {
//           UserId: userId,
//           PostId: +postId,
//           content: content,
//         },
//       });
//       console.log("comment>>>>>.", comment);
//       // commentCount
//       await prisma.posts.update({
//         where: { postId: +postId },
//         data: {
//           commentCount: {
//             increment: 1,
//           },
//         },
//       });

//       if (!comment) {
//         return res
//           .status(401)
//           .json({ errorMessage: "댓글을 등록할 권한이 없습니다." });
//       }
//       return res.status(200).json({ data: comment });
//     } catch (error) {
//       next(error);
//     }
//   },
// );



// comment GET API
// router.get("/posts/:postId/comments", async (req, res, next) => {
//   try {
//     const { postId } = req.params;

//     const post = await prisma.posts.findFirst({
//       where: { postId: +postId },
//     });

//     if (!post) {
//       return res
//         .status(404)
//         .json({ errorMessage: "이미 삭제되었거나, 없는 댓글입니다." });
//     }

//     // 댓글 전부 조회
//     const comment = await prisma.comments.findMany({
//       where: { PostId: +postId },
//       select: {
//         User: {
//           select: {
//             nickname: true,
//             imgUrl: true,
//           },
//         },
//         Post: {
//           select: {
//             postId: true,
//           },
//         },
//         commentId: true,
//         content: true,
//         replyCount: true,
//         createdAt: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // 각 댓글의 사용자 이미지를 S3에서 불러오기
//     const commentsWithImages = await Promise.all(
//       comment.map(async (comment) => {
//         if (comment.User.imgUrl && comment.User.imgUrl.length === 64) {
//           const getObjectParams = {
//             Bucket: bucketName, // 버킷 이름
//             Key: comment.User.imgUrl, // 이미지 키
//           };

//           // GetObjectCommand를 사용하여 이미지 URL을 생성
//           const command = new GetObjectCommand(getObjectParams);
//           const url = await getSignedUrl(s3, command);

//           // 불러온 이미지 URL로 대체
//           comment.User.imgUrl = url;
//         }
//       }),
//     );
//     return res.status(200).json({ data: comment });
//   } catch (error) {
//     next(error);
//   }
// });


// comment DELETE API
// router.delete(
//   "/posts/:postId/comments/:commentId",
//   authMiddleware,
//   async (req, res, next) => {
//     try {
//       const { userId } = req.user;
//       const { commentId, postId } = req.params;

//       if (!userId) {
//         return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
//       }

//       await prisma.$transaction(async (prisma) => {
//         const comment = await prisma.comments.findFirst({
//           where: { commentId: +commentId },
//         });

//         if (!comment) {
//           return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
//         }

//         const deleteComment = await prisma.comments.delete({
//           where: { UserId: userId, commentId: +commentId },
//         });

//         if (!deleteComment) {
//           return res.status(401).json({ message: "삭제할 권한이 없습니다." });
//         }

//         // 댓글 수량 업데이트 -1
//         await prisma.posts.update({
//           where: { postId: +postId },
//           data: {
//             commentCount: {
//               decrement: 1,
//             },
//           },
//         });

//         return res.status(200).json({ message: "댓글이 삭제되었습니다." });
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// );

export default router;
