import { CommentsRepository } from "../repositories/comments.repository.js";

export class CommentsService {
  commentsRepository = new CommentsRepository();

  validateReply = async (replyData) => {
    try {
      const validation = await createRepliesSchema.validateAsync(replyData);
      return validation;
    } catch (error) {
      throw error;
    }
  };

  createReply = async (userId, commentId, content) => {
    try {
      const comment = await this.commentsRepository.findCommentById(commentId);

      if (!comment) {
        throw new Error("댓글을 찾을 수 없습니다.");
      }

      const reply = await this.commentsRepository.createReply(
        userId,
        commentId,
        content,
      );

      return reply;
    } catch (error) {
      throw error;
    }
  };
}

// 조회
getRepliesWithImages = async (commentId) => {
  try {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const replies = await this.commentsRepository.getReplies(commentId);

    const repliesWithImages = await this.getRepliesWithImagesFromS3(replies);

    return repliesWithImages;
  } catch (error) {
    throw error;
  }
};

getRepliesWithImagesFromS3 = async (replies) => {
  return Promise.all(
    replies.map(async (reply) => {
      if (reply.User.imgUrl && reply.User.imgUrl.length === 64) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: reply.User.imgUrl,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command);

        reply.User.imgUrl = url;
      }
      return reply;
    }),
  );
};

// 삭제

deleteReply = async (userId, replyId, commentId) => {
  try {
    const reply = await this.commentsRepository.findReplyById(replyId);

    if (!reply) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const deleteReply = await this.commentsRepository.deleteReply(
      userId,
      replyId,
      commentId,
    );

    if (!deleteReply) {
      throw new Error("삭제할 권한이 없습니다.");
    }

    await this.commentsRepository.decrementReplyCount(commentId);
  } catch (error) {
    throw error;
  }
};
