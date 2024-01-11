import { RepliesService } from "../services/replies.service.js";
import { createRepliesSchema } from "../validations/replies.validation.js";

export class RepliesController {
  repliesService = new RepliesService();
  // 등록
  createReply = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { commentId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
      }

      const validation = await createRepliesSchema.validateAsync(req.body);
      const { content } = validation;

      const reply = await this.repliesService.createReply(
        userId,
        commentId,
        content,
      );

      return res.status(200).json( reply );
    } catch (error) {
      next(error);
    }
  };

  // 조회
  getReplies = async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const { page, lastSeenId } = req.query;

      const replies = await this.repliesService.getReplies(
        commentId,
        page,
        lastSeenId,
      );

      return res.status(200).json( replies );
    } catch (error) {
      next(error);
    }
  };

  // 삭제
  deleteReply = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { replyId, commentId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "로그인 후 사용하여 주세요." });
      }

      await this.repliesService.deleteReply(userId, replyId, commentId);

      return res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
      next(error);
    }
  };
}
