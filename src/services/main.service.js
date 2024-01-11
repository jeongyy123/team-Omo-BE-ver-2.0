import { getManyImagesS3 } from "../utils/getImageS3.js";

export class MainService {
  constructor(mainRepository) {
    this.mainRepository = mainRepository;
  }
  /* 인기글 조회 */
  getPoplurPosts = async (districtName, limit) => {
    const popularPosts = await this.mainRepository.getPoplurPosts(
      districtName,
      limit,
    );

    if (!popularPosts || popularPosts === 0) {
      const err = new Error("해당 인기글이 없어요");
      err.statusCode = 400;
      throw err;
    }

    await getManyImagesS3(popularPosts);

    return popularPosts;
  };

  /* 최신글 조회 */
  getRecentPosts = async (districtName, limit, categoryName) => {
    const parsedLimit = +limit || 9;

    if (!parsedLimit || parsedLimit <= 0) {
      const err = new Error("limit값을 입력해주세요");
      err.statusCode = 400;
      throw err;
    }

    const recentPosts = await this.mainRepository.getRecentPosts(
      districtName,
      limit,
      categoryName,
    );

    if (!recentPosts || recentPosts === 0) {
      const err = new Error("해당 최신글이 없어요");
      err.statusCode = 400;
      throw err;
    }

    await getManyImagesS3(recentPosts);

    return recentPosts;
  };

  /* 댓글 조회 */
  getRecentComments = async (districtName, limit) => {
    const recentComments = await this.mainRepository.getRecentComments(
      districtName,
      limit,
    );

    if (!recentComments) {
      const err = new Error("해당 댓글이 없어요.");
      err.statusCode = 400;
      throw err;
    }
    return recentComments;
  };
}
