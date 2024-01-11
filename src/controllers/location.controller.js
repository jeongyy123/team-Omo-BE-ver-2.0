import { LocationService } from "../services/location.service.js";

export class LocationController {
  locationService = new LocationService();
  //둘러보기
  getSurroundLocation = async (req, res, next) => {
    try {
      const { categoryName, qa, pa, ha, oa } = req.query;

      const location = await this.locationService.getSurroundLocation(
        categoryName,
        qa,
        pa,
        ha,
        oa,
      );

      if (
        !categoryName ||
        !["음식점", "카페", "기타", "전체"].includes(categoryName)
      ) {
        throw new Error("올바른 카테고리를 입력하세요.");
      }

      return res.status(200).json(location);
    } catch (error) {
      next(error);
    }
  };

  // 인기
  getPopularLocation = async (req, res, next) => {
    try {
      const { latitude, longitude } = req.query;
      const { locationId } = req.params;

      if (!locationId) {
        return res
          .status(400)
          .json({ message: "locationId 요청 송신에 오류가 있습니다." });
      }

      const location = await this.locationService.getPopularLocation(
        locationId,
        latitude,
        longitude,
      );

      const posts = await this.locationService.getPopularPosts(locationId);

      return res.status(200).json({ location, posts });
    } catch (error) {
      next(error);
    }
  };
}
