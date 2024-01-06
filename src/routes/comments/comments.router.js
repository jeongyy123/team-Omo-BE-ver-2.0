import express from "express";
import { CommentsController } from "../../controllers/comments.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";


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


export default router;
