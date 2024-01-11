import express from "express";
import { CommentsController } from "../controllers/comments.controller.js";
import { CommentsService } from "../services/comments.service.js";
import { CommentsRepository } from "../repositories/comments.repository.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();
const commentsController = new CommentsController(commentsService);
const commentsService = new CommentsService(commentsRepository);
const commentsRepository = new CommentsRepository(prisma)


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


export default router;
