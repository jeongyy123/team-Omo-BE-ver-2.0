import {
  getRepliesImageS3,
  getProfileImageS3,
  getManyImagesS3,
  getSingleImageS3,
  getImageS3,
} from "../utils/getImageS3.js";
import { processPutImages } from '../utils/putImageS3.js';
import { deleteImageS3 } from '../utils/deleteImageS3.js'
import dotenv from "dotenv";

dotenv.config();

export class PostsService {
  constructor(postsRepository) {
    this.postsRepository = postsRepository;
  }
  /* 게시글 목록 조회 */
  findAllPosts = async (page, lastSeenPage, categoryName, districtName) => {
    const posts = await this.postsRepository.findAllPosts(
      page,
      lastSeenPage,
      categoryName,
      districtName,
    );

    await getManyImagesS3(posts);

    return posts;
  };

  /* 게시글 상세 조회 */
  findPostById = async (postId) => {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.");
      err.statusCode = 404;
      throw err;
    }

    await getRepliesImageS3(post.Comments);
    await getProfileImageS3(post.Comments);
    await getSingleImageS3(post.User);
    await getImageS3(post);

    return post;
  };

  /* 게시글 작성 */
  createPost = async (
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
  ) => {
    const imgNames = await processPutImages(files);

    const category = await this.postsRepository.findCategory(categoryName);

    if (!category) {
      const err = new Error("존재하지않는 카테고리입니다.");
      err.statusCode = 404;
      throw err;
    }

    const district = await this.postsRepository.findDistrict(address);

    if (!district) {
      const err = new Error("지역이 존재하지 않습니다.");
      err.statusCode = 404;
      throw err;
    }

    await this.postsRepository.createPost(
      userId,
      content,
      categoryName,
      storeName,
      address,
      latitude,
      longitude,
      star,
      placeInfoId,
      imgNames,
    );

    return {
      message: "게시글 등록이 완료되었습니다.",
    };
  };

  /* 게시글 수정 */
  updatePost = async (
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
  ) => {
    const post = await this.postsRepository.findPostByPostId(
      postId,
    );

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.");
      err.statusCode = 400;
      throw err;
    }

    if (post.UserId !== userId) {
      const err = new Error("수정할 권한이 존재하지 않습니다.");
      err.statusCode = 401;
      throw err;
    }

    await this.postsRepository.updatePost(
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

    return {
      message: "게시물을 수정하였습니다.",
    };
  };

  /* 게시글 찾기 by PostId, UserId */
  findPostByPostId = async (postId) => {
    const post = await this.postsRepository.findPostByPostId(
      postId,
    );

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.");
      err.statusCode = 400;
      throw err;
    }
    return post;
  };

  /* 게시글 삭제 */
  deletePost = async (userId, postId) => {
    const post = await this.postsRepository.findPostByPostId(
      postId,
    );

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.");
      err.statusCode = 400;
      throw err;
    }

    if (post.UserId !== userId) {
      const err = new Error("삭제할 권한이 존재하지 않습니다.");
      err.statusCode = 401;
      throw err;
    }

    await deleteImageS3(post);

    await this.postsRepository.deletePost(userId, postId);

    return {
      message: "게시글을 삭제하였습니다.",
    };
  };
}
