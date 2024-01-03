import { PostsService } from "../services/posts.service.js";
import {
  createPostsSchema,
  editPostsSchema,
} from "../validations/posts.validation.js";

export class PostsController {
  postsService = new PostsService();

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

      const post = await this.postsService.findPostById(postId);

      return res.status(200).json(post);
    } catch (error) {
      if (error.message) {
        return res.status(404).json({ message: error.message });
      }
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

      await this.postsService.findPostByPostId(postId);

      return res.status(201).json({ message: "게시물을 수정하였습니다." });
    } catch (error) {
      next(error);
    }
  };

  /* 게시글 삭제 */
  deletePost = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { postId } = req.params;

      await this.postsService.findPostByPostId(postId);

      await this.postsService.deletePost(userId, postId);

      return res.status(200).json({ message: "게시글을 삭제하였습니다." });
    } catch (error) {
      next(error);
    }
  };
}
