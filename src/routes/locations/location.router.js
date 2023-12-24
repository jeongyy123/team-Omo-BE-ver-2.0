import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import haversine from "haversine";
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { getManyImagesS3, getSingleImageS3, getImageS3 } from "../../utils/getImageS3.js"


dotenv.config();

const router = express.Router();
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
    const { qa, pa, ha, oa } = req.query;


    const categories = await prisma.categories.findFirst({

      where: { categoryName },
    });
    // 위치 정보 가져오기
    const location = await prisma.locations.findMany({
      where: {
        latitude: {
          gte: qa,
          lte: pa
        },
        longitude: {
          gte: ha,
          lte: oa
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
        // postCount: true,
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
    

    if (!categoryName || !['음식점', '카페', '기타', '전체'].includes(categoryName)) {
      return res.status(400).json({ message: "올바른 카테고리를 입력하세요." });
    }

    let category;
    if (categoryName !== '전체') {
      category = await prisma.categories.findFirst({
        where: { categoryName },
      });
    } else {
      category = { categoryId: null };
    }

    // const latitude = ((Number(qa) + Number(pa)) / 2).toFixed(10)
    // const longitude = ((Number(ha) + Number(oa)) / 2).toFixed(10)
    // console.log(">>>>>>>>>>>", latitude)

    // 거리 계산 및 정렬
    const start = {
      latitude: +latitude || qa,
      longitude: +longitude || ha
    }

    // 게시글 개수, 거리차 추가
    const locationsWithDistance = await Promise.all(
      location.map(async (loc) => {
        const distance = +haversine(
          start,
          { latitude: loc.latitude, longitude: loc.longitude },
          { unit: "meter" },
        ).toFixed(10);
        console.log("distance>>>>>>>>>>>", distance)
        return {
          ...loc
        };
      }),
    );


      // 이미지 배열로 반환하는 로직
      const imgUrlsArray = locationsWithDistance
        .sort((a, b) => a.distance - b.distance);

      const paramsArray = imgUrlsArray.map((arr) =>
      arr.Posts[0].imgUrl.split(",").flatMap((url) => ({
        Bucket: bucketName,
        Key: url,
      })),
      );

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

      const locationsWithSignedUrls = locationsWithDistance.map((location, locationIndex) => ({
        ...location,
        Posts: location.Posts.map((post, postIndex) => ({
          ...post,
          imgUrl: signedUrlsArray[locationIndex][postIndex],
        })),
      }));
      const imgUrlfirstindex = locationsWithSignedUrls
      // console.log("start", start)
      // console.log("Category:", category);
      // console.log("Location:", location);
      // console.log("Locations with Distance>>>>>>>>>>", locationsWithDistance);
      // console.log("Img URLs Array:", imgUrlsArray);
      // console.log("Params Array:", paramsArray);
      // console.log("Signed URLs Array:", signedUrlsArray);
      // console.log("Locations with Signed URLs:", locationsWithSignedUrls);
  
      return res.status(200).json(locationsWithSignedUrls);
  } catch (error) {
    console.log(error)
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
          }
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

    // 좋아요 순서로 정렬
    const sortedPosts = posts.sort((a, b) => b.likeCount - a.likeCount)

    await getManyImagesS3(sortedPosts)


    for (const post of sortedPosts) {
      const params = {
        Bucket: bucketName,
        Key: post.User.imgUrl
      }
      const command = new GetObjectCommand(params);
      const imgUrl = await getSignedUrl(s3, command);
      post.User.imgUrl = imgUrl
    }

    return res.status(200).json({ location, posts: posts });
  } catch (error) {
    next(error)
  }
});


export default router;