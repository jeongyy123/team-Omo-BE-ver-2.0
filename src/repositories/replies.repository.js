import { prisma } from "../utils/prisma/index.js";

export class RepliesRepository {
  //등록
  findCommentById = async (commentId) => {
    const comment = await prisma.comments.findFirst({
      where: { commentId: +commentId },
    });

    return comment;
  };

  createReply = async (userId, commentId, content) => {
    const reply = await prisma.replies.create({
      data: {
        UserId: userId,
        CommentId: +commentId,
        content: content,
      },
    });

    await prisma.comments.update({
      where: { commentId: +commentId },
      data: {
        replyCount: {
          increment: 1,
        },
      },
    });

    return reply;
  };

  // 전부조회
  findAllReplies = async (commentId, page, lastSeenId) => {
    const parsedPage = parseInt(page, 10) || 1;

    const replies = await prisma.replies.findMany({
      where: { CommentId: +commentId },
      select: {
        User: {
          select: {
            userId: true,
            nickname: true,
            imgUrl: true,
          },
        },
        Comment: {
          select: {
            commentId: true,
            replyCount: true,
          },
        },
        replyId: true,
        content: true,
        createdAt: true,
      },
      take: parsedPage,
      skip: lastSeenId ? 1 : 0,
      ...(+lastSeenId && { cursor: { replyId: +lastSeenId } }),
    });
    return replies;
  };

  // 삭제
  findReplyById = async (replyId) => {
    const reply = await prisma.replies.findFirst({
      where: { replyId: +replyId },
    });
    return reply;
  };

  deleteReply = async (userId, replyId) => {
    const deleteReply = await prisma.replies.delete({
      where: { UserId: userId, replyId: +replyId },
    });
    return deleteReply;
  };

  decrementReplyCount = async (commentId) => {
    await prisma.comments.update({
      where: { commentId: +commentId },
      data: {
        replyCount: {
          decrement: 1,
        },
      },
    });
  };
}
