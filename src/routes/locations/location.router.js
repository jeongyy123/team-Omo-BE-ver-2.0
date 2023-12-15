import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import haversine from "haversine";
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { getManyImagesS3 } from "../../utils/getImageS3.js"
// import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 모든 위치 (둘러보기)
router.get("/locations", async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    const { districtName } = req.query;

    // 위치 정보 가져오기
    const location = await prisma.locations.findMany({
      where: { District: { districtName: districtName } },
      select: {
        address: true,
        latitude: true,
        longitude: true,
        Posts: {
          select: {
            imgUrl: true,
            starAvg: 5
          },
          take: 1,
          skip: 1,
        },
        Category: {
          select: {
            categoryName: true,
          },
        },
      },
    });

    console.log("여기예요 여기", location)

    // 거리 계산 및 정렬
    if (latitude && longitude) {

      const start = {
        latitude: +latitude,
        longitude: +longitude,
      };

      const locationsWithDistance = location
        .map((loc) => {
          return {
            ...loc,
            distance: haversine(
              start,
              { latitude: loc.latitude, longitude: loc.longitude },
              { unit: "meter" },
            ),
          };
        })
        .sort((a, b) => a.distance - b.distance);

      const imgUrlsArray = locationsWithDistance.flatMap((location) =>
        location.Posts.map((post) => post.imgUrl),
      );

      console.log("imgUrlsArray", imgUrlsArray)


      const paramsArray = imgUrlsArray.map((url) => ({
        Bucket: bucketName,
        Key: url,
      }));

      const signedUrlsArray = await Promise.all(
        paramsArray.map(async (params) => {
          const commands = new GetObjectCommand(params);
          const urls = await getSignedUrl(s3, commands, {
            region: "ap-northeast-2",
          });
          return urls;
        })
      )

      // // console.log("이곳", signedUrlsArray)
      // const locationsWithSignedUrls = locationsWithDistance.map(
      //   (location, index) => ({
      //     ...location,
      //     Posts: location.Posts.map((post, postIndex) => ({
      //       ...post,
      //       imgUrl: signedUrlsArray[postIndex],
      //     })),
      //   })
      // );
      // for (let i = 0; i < locationsWithDistance.length; i++) {
      //   locationsWithDistance[i].imgUrl = signedUrlsArray[i];
      // }

      return res.status(200).json({ location });
    } else {
      return res.status(200).json({ location });
    }

  } catch (error) {
    next(error);
  }
});





export default router;











