import { CommentsRepository } from "../repositories/comments.repository.js";

export class CommentsService {
  commentsRepository = new CommentsRepository();
  // 등록
  validateComment = async (commentData) => {
    try {
      const validation = await createCommentsSchema.validateAsync(commentData);
      return validation;
    } catch (error) {
      throw error;
    }
  };

  createComment = async (userId, postId, content) => {
    try {
      const post = await this.commentsRepository.findPostById(postId);

      if (!post) {
        throw new Error("게시물을 찾을 수 없습니다.");
      }

      const comment = await this.commentsRepository.createComment(
        userId,
        postId,
        content,
      );

      return comment;
    } catch (error) {
      throw error;
    }
  };
  // 조회
  getCommentsByPostId = async (postId) => {
    try {
      const post = await prisma.posts.findFirst({
        where: { postId: +postId },
      });

      if (!post) {
        throw new Error("이미 삭제되었거나, 없는 댓글입니다.");
      }

      const comments = await prisma.comments.findMany({
        where: { PostId: +postId },
        select: {
          User: {
            select: {
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
      });

      // 이미지 가져오기 로직을 서비스 내부로 이동
      const commentsWithImages = await this.getCommentsWithImages(comments);

      return commentsWithImages;
    } catch (error) {
      throw error;
    }
  };

  // 이미지 가져오기 로직을 서비스 내부로 이동
  getCommentsWithImages = async (comments) => {
    return Promise.all(
      comments.map(async (comment) => {
        if (comment.User.imgUrl && comment.User.imgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName, // 버킷 이름
            Key: comment.User.imgUrl, // 이미지 키
          };

          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command);

          comment.User.imgUrl = url;
        }
        return comment;
      }),
    );
  };
}

deleteComment = async (userId, commentId, postId) => {
  try {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const deleteComment = await this.commentsRepository.deleteComment(
      userId,
      commentId,
    );

    if (!deleteComment) {
      throw new Error("삭제할 권한이 없습니다.");
    }

    await this.commentsRepository.decrementCommentCount(postId);
  } catch (error) {
    throw error;
  }
};
