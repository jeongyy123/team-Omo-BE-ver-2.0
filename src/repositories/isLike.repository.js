export class IsLikeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  createLike = async (postId, userId) => {
    await this.prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { increment: 1 } },
    });

    await this.prisma.likes.create({
      data: { PostId: +postId, UserId: +userId },
    });

    return { message: "좋아요" };
  };

  deleteLike = async (postId, userId) => {
    const findLike = await this.prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId },
    });

    await this.prisma.posts.update({
      where: { postId: +postId },
      data: { likeCount: { decrement: 1 } },
    });

    await this.prisma.likes.delete({
      where: { likeId: findLike.likeId },
    });

    return { message: "좋아요 취소" };
  };

  findPostByPostId = async (postId) => {
    return await this.prisma.posts.findFirst({
      where: { postId: +postId },
    });
  };

  findLikeByPostIdAndUserId = async (postId, userId) => {
    return await this.prisma.likes.findFirst({
      where: { PostId: +postId, UserId: +userId },
    });
  };

  getLikedPostsByUser = async (userId) => {
    const likedPosts = await this.prisma.likes.findMany({
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
  };
}
