import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";

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
    const comment = await prisma.comments.findMany({
      where: { PostId: +postId },
      orderBy: { createdAt: "desc" },
    });
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
    const { userId } = req.user;
    const { commentId } = req.params;

    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });
    await prisma.comments.delete({
      where: { UserId: userId, commentId: +commentId },
    });
    return res.status(200).json({ data: comment });
  },
);

export default router;
