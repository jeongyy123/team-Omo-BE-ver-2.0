import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 좋아요
router.post("/posts/:postId/like", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId }
    })

    if (!post) {
      return res.status(400).json({ message: "해당 게시글이 존재하지 않습니다. " })
    }

    const findLike = await prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId }
    })

    if (findLike) {
      return res.status(400).json({ message: "이미 좋아요한 게시글입니다." })
    }

    await prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { increment: 1 } }
    })

    await prisma.likes.create({
      data: { PostId: +postId, UserId: +userId }
    })

    return res.status(200).json({ message: "좋아요" })
  } catch (error) {
    next(error)
  }
});

//좋아요 취소
router.delete("/posts/:postId/like", authMiddleware, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.user;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId }
    })

    if (!post) {
      return res.status(400).json({ message: "해당 게시글이 존재하지 않습니다. " })
    }

    const findLike = await prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId }
    })

    if (!findLike) {
      return res.status(400).json({ message: "이미 좋아요 취소한 게시글입니다." })
    }

    await prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { decrement: 1 } }
    })

    await prisma.likes.delete({
      where: { likeId: findLike.likeId }
    })


    return res.status(200).json({ message: "좋아요 취소" })
  } catch (error) {
    next(error)
  }
})

// 유저별 좋아요한 게시글 조회
router.get("/users/posts/like", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const likes = await prisma.likes.findMany({
      where: { UserId: +userId }
    })

    if (!likes) {
      return res.status(400).json({ message: "좋아요한 게시글이 없습니다." })
    }

    return res.status(200).json(likes)
  } catch (error) {
    next(error)
  }
})

export default router;