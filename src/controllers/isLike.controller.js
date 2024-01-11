export class IsLikeController {
  constructor(isLikeService) {
    this.isLikeService = isLikeService;
  }
  /* 좋아요 */
  createLike = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;

      await this.isLikeService.createLike(postId, userId);

      return res.status(201).json({ message: "좋아요" });
    } catch (error) {
      next(error);
    }
  };

  /* 좋아요 취소 */
  deleteLike = async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { userId } = req.user;

      await this.isLikeService.deleteLike(postId, userId);

      return res.status(200).json({ message: "좋아요 취소" });
    } catch (error) {
      next(error);
    }
  };

  /* 유저별 좋아요한 게시글 조회 */
  getLikedPostsByUser = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const likedPosts = await this.isLikeService.getLikedPostsByUser(userId);

      return res.status(200).json(likedPosts);
    } catch (error) {
      next(error);
    }
  };
}
