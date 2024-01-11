export class IsLikeService {
  constructor(isLikeRepository) {
    this.isLikeRepository = isLikeRepository;
  }

  createLike = async (postId, userId) => {
    const post = await this.isLikeRepository.findPostByPostId(postId);

    if (!post) {
      const err = new Error("해당 게시글이 존재하지 않습니다.");
      err.statusCode = 400;
      throw err;
    }

    const like = await this.isLikeRepository.findLikeByPostIdAndUserId(
      postId,
      userId,
    );

    if (like) {
      const err = new Error("이미 좋아요한 게시글입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.isLikeRepository.createLike(postId, userId);

    return { message: "좋아요" };
  };

  deleteLike = async (postId, userId) => {
    const post = await this.isLikeRepository.findPostByPostId(postId);

    if (!post) {
      const err = new Error("해당 게시글이 존재하지 않습니다.");
      err.statusCode = 400;
      throw err;
    }

    const like = await this.isLikeRepository.findLikeByPostIdAndUserId(
      postId,
      userId,
    );

    if (!like) {
      const err = new Error("이미 좋아요 취소한 게시글입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.isLikeRepository.deleteLike(postId, userId);

    return { message: "좋아요 취소" };
  };

  getLikedPostsByUser = async (userId) => {
    const likedPosts = await this.isLikeRepository.getLikedPostsByUser(userId);

    if (!likedPosts) {
      const err = new Error("좋아요한 게시글이 없습니다.");
      err.statusCode = 400;
      throw err;
    }
    return likedPosts;
  };
}
