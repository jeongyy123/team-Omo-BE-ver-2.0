import { prisma } from "../utils/prisma/index.js";

export class IsLikeRepository {
  createLike = async (postId, userId) => {
    await prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { increment: 1 } },
    });

    await prisma.likes.create({
      data: { PostId: +postId, UserId: +userId },
    });

    return { message: "좋아요" }
  }

  deleteLike = async (postId, userId) => {
    const findLike = await prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId },
    });

    await prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { decrement: 1 } },
    });

    await prisma.likes.delete({
      where: { likeId: findLike.likeId },
    });

    return { message: "좋아요 취소" }
  }

  findPostByPostId = async (postId) => {
    return await prisma.posts.findFirst({
      where: { postId: +postId },
    });
  }

  findLikeByPostIdAndUserId = async (postId, userId) => {
    return await prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId },
    });
  }

  getLikedPostsByUser = async (userId) => {
    const likedPosts = await prisma.likes.findMany({
      where: { UserId: +userId },
      select: {
        likeId: true,
        PostId: true,
        UserId: true,
        Post: {
          select: {
            Location: {
              select: { locationId: true },
            },
          },
        },
      },
    });

    return likedPosts;
  }
}