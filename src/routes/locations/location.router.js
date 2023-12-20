import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import haversine from "haversine";
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { getManyImagesS3, getSingleImageS3, getImageS3 } from "../../utils/getImageS3.js"

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


//둘러보기
router.get("/locations", async (req, res, next) => {
  try {
    const { categoryName } = req.query;
    const { latitude, longitude, qa, pa, ha, oa } = req.query;
    // const { districtName } = req.query;
    const category = await prisma.categories.findFirst({
      // 이거
      where: { categoryName },
    });
    // 위치 정보 가져오기
    const location = await prisma.locations.findMany({
      where: {
        latitude: {
          gte: qa,
          lte: pa,
        },
        longitude: {
          gte: ha,
          lte: oa,
        },
        ...(category?.categoryId && { CategoryId: category.categoryId }),
      },
      select: {
        locationId: true,
        storeName: true,
        address: true,
        latitude: true,
        longitude: true,
        starAvg: true,
        postCount: true,
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
          },
        },
      },
    });

    // 거리 계산 및 정렬
    if (latitude && longitude) {
      const start = {
        latitude: +latitude,
        longitude: +longitude,
      };

      // 게시글 개수, 거리차 추가
      const locationsWithDistance = await Promise.all(
        location.map(async (loc) => {
          const distance = haversine(
            start,
            { latitude: loc.latitude, longitude: loc.longitude },
            { unit: "meter" },
          );
          return {
            ...loc,
            distance,
          };
        }),
      );



      // 이미지 배열로 반환하는 로직
      const imgUrlsArray = locationsWithDistance
        .sort((a, b) => a.distance - b.distance);
      // .flatMap((location) => location.Posts.map((post) => post.imgUrl));

      // console.log("0번째 인덱스", imgUrlsArray)

      const paramsArray = imgUrlsArray.map((arr) =>
        // console.log("허이허이", arr.Posts[0].imgUrl)
        arr.Posts[0].imgUrl.split(",").flatMap((url) => ({
          Bucket: bucketName,
          Key: url,
        })),
      );

      console.log("0 >>>>>>>>>>>", paramsArray);
      const signedUrlsArray = await Promise.all(
        paramsArray.map(async (locationParams) => {
          const locationSignedUrls = await Promise.all(
            locationParams.map(async (params) => {
              const commands = new GetObjectCommand(params);
              return await getSignedUrl(s3, commands);
            })
          );

          return locationSignedUrls;
        }),
      );

      console.log("1 >>>>>>>>>>>", signedUrlsArray);

      const locationsWithSignedUrls = locationsWithDistance.map((location, locationIndex) => ({
        ...location,
        Posts: location.Posts.map((post, postIndex) => ({
          ...post,
          imgUrl: signedUrlsArray[locationIndex][postIndex],
        })),
      }));
      const imgUrlfirstindex = locationsWithSignedUrls

      return res.status(200).json(locationsWithSignedUrls);
    }
    return res.status(200).json({ location });
  } catch (error) {
    next(error);
  }
});


// // 인기게시글 
// // 해당 하는 지역에 postId, latitude, longitude, 별점, content, likeCount
// // commentCount, imgUrl, createdAt
router.get("/locations/:locationId", async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query
    const { locationId } = req.params
    

    const location = await prisma.locations.findFirst({
      where: { locationId: +locationId },
      select: {
        locationId: true,
        address: true,
        starAvg: true,
        postCount: true,
        storeName: true,
        Posts: {
          select: {
            imgUrl: true
          },
          skip: 1,
          take: 1
        }
      }
    })
    // 16진수로 바꾼 imgUrl 을 , 기준으로 split 해주기
    const locationImgUrlsArray = location.Posts[0].imgUrl.split(",")
    
    const locationParamsArray = locationImgUrlsArray.map((imgUrl) => ({
      Bucket: bucketName,
      Key: imgUrl
    }))

    const locationSignedUrlsArray = await Promise.all(
      locationParamsArray.map(async (params) => {
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3, command);
        return signedUrl;
      }),
    );
    
    location.Posts[0].imgUrl = locationSignedUrlsArray[0]

    const posts = await prisma.posts.findMany({
      where: {
        LocationId: +locationId
      },
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true
          }
        },
        postId: true,
        imgUrl: true,
        content: true,
        commentCount: true,
        likeCount: true,
        star: true,
        createdAt: true
      }
    })
    // console.log("posts>>>>>>>>>>", posts)

    // 좋아요 순서로 정렬
    const sortedPosts = posts.sort((a, b) => b.likeCount - a.likeCount)

    await getManyImagesS3(sortedPosts)


    for (const post of sortedPosts) { // 이해 안됨... for...of 의 존재는 암 검색ㄱㄱ
      const params = {
        Bucket: bucketName,
        Key: post.User.imgUrl
      }
      console.log("params?>>>>>>>>>", params)
      const command = new GetObjectCommand(params);
      console.log("command>>>>", command)
      const imgUrl = await getSignedUrl(s3, command);
      console.log("imgUrl>>>>>>...", imgUrl)
      post.User.imgUrl = imgUrl
    }

    
  //   console.log("sortedPosts>>>", sortedPosts)
  //   const imgUrlsArray = sortedPosts.flatMap((post) => post.imgUrl.split(","));
  //   console.log("imgUrlsArray>>>>>>", imgUrlsArray)
  //   const paramsArray = imgUrlsArray.map((arr) =>
  //   arr.imgUrl.split(",").flatMap((url) => ({
  //     Bucket: bucketName,
  //     Key: url,
  //   })),
  //   console.log("paramsArray>>>>", paramsArray)
  // );

  //   const signedUrlsArray = await Promise.all(
  //     paramsArray.map(async (params) => {
  //       const command = new GetObjectCommand(params);
  //       const signedUrl = await getSignedUrl(s3, command);
  //       return signedUrl;
  //     })
  //   );
  //   // imgUrl을 signedUrlsArray로 교체
  //   location.Posts.forEach((post, index) => {
  //     post.imgUrl = signedUrlsArray[index];
  //   });

    return res.status(200).json({ location, posts: posts });
  } catch (error) {
    next(error)
  }
});


export default router;