import {
  createPostsSchema,
  editPostsSchema,
} from "../validations/posts.validation.js";

export class PostsController {
  constructor(postsService) {
    this.postsService = postsService;
  }

  /* 게시글 목록 조회 */
  getPosts = async (req, res, next) => {
    try {
      const { page, lastSeenPage, categoryName, districtName } = req.query;

      const posts = await this.postsService.findAllPosts(
        page,
        lastSeenPage,
        categoryName,
        districtName,
      );

      return res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  };

  /* 게시글 상세 조회 */
  getPostById = async (req, res, next) => {
    try {
      const { postId } = req.params;

      if (!postId) {
        return res.status(400).json({ message: "잘못된 요청입니다." });
      }

      const post = await this.postsService.findPostById(postId);

      return res.status(200).json(post);
    } catch (error) {
      next(error);
    }
  };

  /* 게시글 작성 */
  createPost = async (req, res, next) => {
    try {
      const validation = await createPostsSchema.validateAsync(req.body);
      const {
        content,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
        placeInfoId,
        // hashtagName,
      } = validation;
      const { userId } = req.user;
      const files = req.files;

      await this.postsService.createPost(
        userId,
        content,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
        placeInfoId,
        files,
        // hashtagName,
      );

      return res.status(201).json({ message: "게시글 등록이 완료되었습니다." });
    } catch (error) {
      next(error);
    }
  };

  /* 게시글 수정 */
  updatePost = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;
      const validation = await editPostsSchema.validateAsync(req.body);
      const {
        address,
        content,
        star,
        storeName,
        placeInfoId,
        latitude,
        longitude,
        categoryName,
      } = validation;

      await this.postsService.updatePost(
        userId,
        postId,
        address,
        content,
        star,
        storeName,
        placeInfoId,
        latitude,
        longitude,
        categoryName,
      );

      return res.status(201).json({
        message: "게시물을 수정하였습니다.",
      });
    } catch (error) {
      next(error);
    }
  };

  /* 게시글 삭제 */
  deletePost = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;

      await this.postsService.deletePost(userId, postId);

      return res.status(200).json({ message: "게시글을 삭제하였습니다." });
    } catch (error) {
      next(error);
    }
  };
}
