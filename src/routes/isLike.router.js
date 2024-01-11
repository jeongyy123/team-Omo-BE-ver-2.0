import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from "../utils/prisma/index.js";
import { IsLikeRepository } from "../repositories/isLike.repository.js";
import { IsLikeService } from "../services/isLike.service.js";
import { IsLikeController } from "../controllers/isLike.controller.js";

const router = express.Router();

const isLikeRepository = new IsLikeRepository(prisma);
const isLikeService = new IsLikeService(isLikeRepository);
const isLikeController = new IsLikeController(isLikeService);

/* 좋아요 */
router.post("/posts/:postId/like", authMiddleware, isLikeController.createLike);

/* 좋아요 취소*/
router.delete(
  "/posts/:postId/like",
  authMiddleware,
  isLikeController.deleteLike,
);

/* 유저의 좋아요 게시글 조회*/
router.get(
  "/users/posts/like",
  authMiddleware,
  isLikeController.getLikedPostsByUser,
);

export default router;
