import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { IsLikeController } from "../controllers/isLike.controller.js";

const router = express.Router();

const isLikeController = new IsLikeController();

/* 좋아요 */
router.post("/posts/:postId/like", authMiddleware, isLikeController.createLike);

/* 좋아요 취소*/
router.delete("/posts/:postId/like", authMiddleware, isLikeController.deleteLike);

/* 유저의 좋아요 게시글 조회*/
router.get("/users/posts/like", authMiddleware, isLikeController.getLikedPostsByUser);

export default router;