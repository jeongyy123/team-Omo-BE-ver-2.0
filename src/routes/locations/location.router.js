import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import haversine from "haversine";
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import {getManyImagesS3, getSingleImageS3, getImageS3} from "../../utils/getImageS3.js"

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
router.get("/locations", async (req, res, next) => {
  try {
    const { categoryName } = req.query;
    const { latitude, longitude } = req.query;
    const { districtName } = req.query;

    const category = await prisma.categories.findFirst({ // 이거
      where: { categoryName }
    })
    // 위치 정보 가져오기
    const location = await prisma.locations.findMany({
      where: {
        // District:
        // {
        //   districtName: districtName
        // },
        ...(category?.categoryId && { CategoryId: category.categoryId } // 이거
        )
      },
      select: {
        locationId: true,
        storeName: true,
        address: true,
        latitude: true,
        longitude: true,
        starAvg: true,
        Category: {
          select: {
            categoryName: true,
          },
        },
        Posts: {
          select: {
            postId: true,
            star: true,
            imgUrl: true,
          }
        },
      },
    });

    // 거리 계산 및 정렬
    if (latitude && longitude) {
      const start = {
        latitude: +latitude,
        longitude: +longitude,
      };
      // const postCount = await prisma.posts.count({
      //   where: { locationId: +locationId }
      // })
      // const locationsWithDistance = location
      //   .map((loc) => {
      //     return {
      //       ...loc,
      //       distance: haversine(
      //         start,
      //         { latitude: loc.latitude, longitude: loc.longitude },
      //         { unit: "meter" },
      //       ),
      //     };
      //   })
      //   .sort((a, b) => a.distance - b.distance);

      const locationsWithDistance = await Promise.all(location.map(async (loc) => {
        const postCount = await prisma.posts.count({
          where: { LocationId: loc.locationId },
        });

        const distance = haversine(
          start,
          { latitude: loc.latitude, longitude: loc.longitude },
          { unit: "meter" }
        );

        return {
          ...loc,
          distance,
          postCount,
        }
      }));

      // 이미지 배열로 반환하는 로직
      const imgUrlsArray = locationsWithDistance.sort((a, b) => a.distance - b.distance)
      .flatMap((location) =>
        location.Posts.map((post) => post.imgUrl)
      );

      // const paramsArray = imgUrlsArray.map((url) => ({
      //   Bucket: bucketName,
      //   Key: url
      // }));
      const paramsArray = imgUrlsArray.flatMap((urls) =>
  urls.split(",").map((url) => ({
    Bucket: bucketName,
    Key: url
  }))
);

      const signedUrlsArray = await Promise.all(
        paramsArray.map(async (params) => {
          const commands = new GetObjectCommand(params);
          const urls = await getSignedUrl(s3, commands);
          return urls;
        })
      )


      const locationsWithSignedUrls = locationsWithDistance.map(
        (location, index) => ({
          ...location,
          Posts: location.Posts.map((post, postIndex) => ({
            ...post,
            imgUrl: signedUrlsArray[postIndex],
          })),
        })
      );
      // for (let i = 0; i < locationsWithDistance.length; i++) {
      //   locationsWithDistance[i].imgUrl = signedUrlsArray[i];
      // }
           // 펼쳐진 Posts 내용 출력
          //  const flatPostsArray = locationsWithSignedUrls.flatMap(
          //   (location) => location.Posts
          // );

          // console.log("response", flatPostsArray);

      return res.status(200).json({ locations: locationsWithSignedUrls });
    } 
      return res.status(200).json({ location });

  } catch (error) {
    next(error);
  }
}); 


// // 인기게시글 
// // 해당 하는 지역에 postId, latitude, longitude, 별점, content, likeCount
// // commentCount, imgUrl, createdAt
// router.get("/locations/:locationId", async (req, res, next) => {
//   try {
//   const { locationId } = req.params

//   const location = await prisma.locations.findFirst({
//     where: { locationId: +locationId },
//     select: { 
//       address: true,
//       starAvg: true,
//       storeName: true,
//       Posts: {
//         select: {
//           imgUrl: true
//         }
//       }
//     }
//   })
//   const posts = await prisma.posts.findMany({
//     where: {
//       LocationId: +locationId
//     },
//     select: {
//       User: {
//         select: {
//           nickname: true,
//           imgUrl: true
//         }
//       },
//       // Category: {
//       //   select: {
//       //     categoryName: true
//       //   }
//       },
//       imgUrl: true,
//       content: true,
//       commentCount: true,
//       likeCount: true,
//       star: true,
//       createdAt: true
//     }
//   })
//   // 좋아요 순서로 정렬
//   const sortedPosts = posts.sort((a, b) => b.likeCount - a.likeCount)
// console.log("나일세", sortedPosts)
//   const imgUrlsArray = sortedPosts.flatMap((post) => post.imgUrl.split(","));
//   const paramsArray = imgUrlsArray.map((url) => ({
//     Bucket: bucketName,
//     Key: url,
//   }));

//   const signedUrlsArray = await Promise.all(
//     paramsArray.map(async (params) => {
//       const command = new GetObjectCommand(params);
//       const signedUrl = await getSignedUrl(s3, command);
//       return signedUrl;
//     })
//   );
//     // imgUrl을 signedUrlsArray로 교체
//     sortedPosts.forEach((post, index) => {
//       post.imgUrl = signedUrlsArray[index];
//     });
    
//     return res.status(200).json({ location, posts: sortedPosts });
//   } catch (error) {
//     next (error)
//   }
// });


export default router;
