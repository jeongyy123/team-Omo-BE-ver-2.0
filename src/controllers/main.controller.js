export class MainController {
  constructor(mainService) {
    this.mainService = mainService;
  };
  /* 인기글 조회 */
  getPoplurPosts = async (req, res, next) => {
    try {
      const { districtName, limit } = req.query;

      const popularPosts = await this.mainService.getPoplurPosts(districtName, limit);

      return res.status(200).json(popularPosts);
    } catch (error) {
      next(error)
    }
  }

  /* 최신글 조회 */
  getRecentPosts = async (req, res, next) => {
    try {
      const { districtName, limit, categoryName } = req.query;

      const recentPosts = await this.mainService.getRecentPosts(districtName, limit, categoryName);

      return res.status(200).json(recentPosts);
    } catch (error) {
      next(error)
    }
  }

  /* 댓글 조회 */
  getRecentComments = async (req, res, next) => {
    try {
      const { districtName, limit } = req.query;

      const recentComments = await this.mainService.getRecentComments(districtName, limit);

      return res.status(200).json(recentComments);
    } catch (error) {
      next(error)
    }
  }
}