// import { LocationService } from "../services/location.service.js";

// export class LocationController {
//   locationservice = new LocationService();
//   //둘러보기
//   getSurroundLocation = async (req, res, next) => {
//     try {
//       const { categoryName, qa, pa, ha, oa } = req.query;
//       const location = await this.locationService.getPostsLocation(categoryName, qa, pa, ha, oa );

//       return res.status(200).json({ daga: location })
//     } catch (error) {
//       next(error);
//     }
//   };
// }
