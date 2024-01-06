import express from "express";
import { RepliesController } from "../../controllers/replies.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";


const router = express.Router();

const repliesController = new RepliesController();
// 등록 api
router.post(
  "/posts/:postId/comments/:commentId/replies",
  authMiddleware,
  repliesController.createReply,
);

// 조회 api
router.get("/posts/:postId/comments/:commentId/replies", repliesController.getReplies);

// 삭제 api
router.delete(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  authMiddleware,
  repliesController.deleteReply,
);


export default router;
