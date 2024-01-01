import { prisma } from "../path/to/your/prisma-instance";

export class CommentsRepository {
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
}
// 조회
findCommentById = async (commentId) => {
  const comment = await prisma.comments.findFirst({
    where: { commentId: +commentId },
  });

  return comment;
};

getReplies = async (commentId) => {
  const replies = await prisma.replies.findMany({
    where: { CommentId: +commentId },
    select: {
      User: {
        select: {
          nickname: true,
          imgUrl: true,
        },
      },
      Comment: {
        select: {
          commentId: true,
          content: true,
          createdAt: true,
        },
      },
      replyId: true,
      content: true,
      createdAt: true,
    },
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

deleteReply = async (userId, replyId, commentId) => {
  const deleteReply = await prisma.replies.delete({
    where: {
      UserId: userId,
      CommentId: +commentId,
      replyId: +replyId,
    },
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
