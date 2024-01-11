import { searchingSchema } from "../validations/searching.validation.js";

export class SearchingController {
  constructor(searchingService) {
    this.searchingService = searchingService;
  }
  getSearching = async (req, res, next) => {
    try {
      const validation = await searchingSchema.validateAsync(req.query);
      const { nickname, storeName } = validation;

      if (!nickname && !storeName) {
        return res
          .status(400)
          .json({ message: "nickname 또는 storeName을 입력해주세요." });
      }

      if (nickname && storeName) {
        return res.status(400).json({
          message: "nickname 또는 storeName 둘 중 하나만 입력해주세요.",
        });
      }

      const seachedData = await this.searchingService.getSearching(
        nickname,
        storeName,
      );

      return res.status(200).json(seachedData);
    } catch (error) {
      next(error);
    }
  };
}
