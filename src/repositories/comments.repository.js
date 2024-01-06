import { prisma } from "../utils/prisma/index.js";

export class CommentsRepository {
  // constructor (prisma) { // 추가
  //   this.prisma = prisma; // 추가
  // }
 
  //등록
  findPostById = async (postId) => {
    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    return post;
  };

  createComment = async (userId, postId, content) => {
    const comment = await prisma.comments.create({
      data: {
        UserId: userId,
        PostId: +postId,
        content: content,
      },
    });

    await prisma.posts.update({
      where: { postId: +postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return comment;
  };
  // 전부조회
  findAllComments = async (postId, page, lastSeenId) => {
    const parsedPage = parseInt(page, 10) || 1;

    const comments = await prisma.comments.findMany({
      where: { PostId: +postId },
      select: {
        User: {
          select: {
            userId: true,
            nickname: true,
            imgUrl: true,
          },
        },
        Post: {
          select: {
            postId: true,
          },
        },
        commentId: true,
        content: true,
        replyCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: parsedPage,
      skip: lastSeenId ? 1 : 0,
      ...(+lastSeenId && { cursor: { commentId: +lastSeenId } }),
    });

    return comments;
  };

  // 삭제
  findCommentById = async (commentId) => {
    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });

    return comment;
  };

  deleteComment = async (userId, commentId) => {
    const deleteComment = await prisma.comments.delete({
      where: { UserId: userId, commentId: +commentId },
    });

    return deleteComment;
  };

  decrementCommentCount = async (postId) => { 
    await prisma.posts.update({
      where: { postId: +postId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });
  };
}
