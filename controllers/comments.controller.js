import { CommentsService } from "../services/comments.service";

export class CommentsController {
  commentsService = new CommentsService();

  // 등록 api
  createComment = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
      }

      const validation = await this.commentsService.validateComment(req.body);
      const { content } = validation;

      const comment = await this.commentsService.createComment(
        userId,
        postId,
        content,
      );

      return res.status(200).json({ data: comment });
    } catch (error) {
      next(error);
    }
  };

  // 조회 api
  getComments = async (req, res, next) => {
    try {
      const { postId } = req.params;

      const comments = await this.commentsService.findAllComments();

      return res.status(200).json({ data: comments });
    } catch (error) {
      next(error);
    }
  };

  // 삭제 api

deleteComment = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { commentId, postId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
    }

    await this.commentsService.deleteComment(userId, commentId, postId);

    return res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
};
}