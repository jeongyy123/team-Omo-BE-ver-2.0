import express from "express";
import multer from "multer";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
import crypto from "crypto";

const router = express.Router();

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: bucketRegion,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

/* 게시물 조회 */
router.get("/posts", async (req, res, next) => {
  try {
    const posts = await prisma.posts.findMany({
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true,
          }
        },
        Location: {
          select: {
            locationId: true,
            storeName: true,
            address: true,
            starAvg: true
          }
        },
        postId: true,
            imgUrl: true,
            content: true,
            likeCount: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const imgUrlsArray = posts.map(post => post.imgUrl.split(','));
    const paramsArray = imgUrlsArray.map(urls => {
      return urls.map(url => ({
        Bucket: bucketName,
        Key: url
      }));
    });

    const signedUrlsArray = await Promise.all(
      paramsArray.map(async (params) => {
        const commands = params.map(param => new GetObjectCommand(param));
        const urls = await Promise.all(commands.map(command => getSignedUrl(s3, command, { expiresIn: 3600 })));
        return urls;
      })
    );

    for (let i = 0; i < posts.length; i++) {
      posts[i].imgUrl = signedUrlsArray[i];
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.log("error", error);
  }
});

/* 게시물 작성 */
router.post("/posts", authMiddleware, upload.array("imgUrl", 5), async (req, res, next) => {
  try {
    const {
      content,
      likeCount,
      categoryName,
      star,
      storeName,
      address,
      latitude,
      longitude,
    } = req.body;
    const { userId } = req.user

    const user = await prisma.users.findFirst({
      where: { userId: userId },
    });

    if (!user) {
      return res.status(400).json({ message: "유저가 존재하지 않습니다." });
    }
    const category = await prisma.categories.findFirst({
      where: { categoryName },
    });

    if (!category) {
      return res.status(400).json({ message: "카테고리가 존재하지 않습니다." });
    }

    console.log("req.body", req.body);
    console.log("req.files", req.files);

    const imgPromises = req.files.map(async (file) => {
      const imgName = randomImgName();

      const params = {
        Bucket: bucketName,
        Key: imgName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);

      return imgName;
    });

    const imgNames = await Promise.all(imgPromises);

    const districtName = address.split(" ")[1];

    const district = await prisma.districts.findFirst({
      where: { districtName }
    });

    if (!district) {
      return res.status(400).json({ message: "지역이 존재하지 않습니다." });
    }

    const location = await prisma.locations.create({
      data: {
        storeName,
        address,
        latitude,
        longitude,
        starAvg: 1,
        Category: { connect: { categoryId: +category.categoryId } },
        District: { connect: { districtId: +district.districtId } },
      },
    });

    const posts = await prisma.posts.create({
      data: {
        content,
        star: +star,
        likeCount: +likeCount,
        User: { connect: { userId: +user.userId } },
        Category: { connect: { categoryId: +category.categoryId } },
        Location: { connect: { locationId: +location.locationId } },
        imgUrl: imgNames.join(","), // imgUrl을 배열로 저장
      },
    });

    return res.status(200).json({ posts });
  } catch (error) {
    console.log("error", error);
  }
});

// 게시물 수정
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
  const { userId } = req.user
  const { postId } = req.params
  const { address, content, star, storeName } = req.body;

  const post = await prisma.posts.findFirst({
    where: { postId: +postId },

  })
  
  if (!post) {
    res.status(404).json({ message: "존재하지 않는 게시글 입니다." })
  }
  await prisma.locations.update({
    where: { locationId: post.LocationId },
    data: { address }
  })

  await prisma.posts.update({
    where: { postId: +postId },
    data: { content, star, storeName }
  })
  return res.status(200).json({ message: "게시물을 수정하였습니다." })
}catch (error) {
  next(error)
}
})

// 게시물 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
  const { userId } = req.user
  const { postId } = req.params

  const post = await prisma.posts.findFirst({
    where: { postId: +postId }
  })
  if (!post) {
    return res.status(404).json({ message: "존재하지 않는 게시글 입니다." })
  }
  if(post.UserId !== userId ){
    return res.status(404).json({ message: "삭제할 권한이 존재하지 않습니다." })
  }
  const imgUrlsArray = post.imgUrl.split(',')

  const params = imgUrlsArray.map(url => {
    return {
      Bucket: bucketName,
      Key: url
    };
  });

  params.map(bucket => {
    return s3.send(new DeleteObjectCommand(bucket))
  })
  
  await prisma.posts.delete({
    where: { postId: +postId }
  })
  return res.status(200).json({ message: "게시글을 삭제하였습니다." })
}catch (error) {
  next(error)
}
})

export default router;




















/* 게시물 목록 조회 */
router.get("/posts", checkCache, async (req, res, next) => {
  try {
    const { page, pageSize, lastSeenPage } = req.query;
    // 마지막 포스트의 postId req로 받아오기

      // 캐시에 없으면 Prisma를 사용하여 데이터 가져오기
      const parsedPage = +page;
      const parsedPageSize = +pageSize;
      const startIndex = (parsedPage - 1) * parsedPageSize;
      const endIndex = startIndex + parsedPageSize;

      // 이전에 확인한 페이지가 있다면 해당 페이지 이후의 데이터만 가져오도록 설정
      const skipCondition = lastSeenPage ? { postId: { lt: +lastSeenPage * parsedPageSize } } : {};

      const totalPosts = await prisma.posts.count();
      const totalPage = Math.ceil(totalPosts / parsedPageSize);

      const posts = await prisma.posts.findMany({
        select: {
          User: {
            select: {
              nickname: true,
              imgUrl: true,
            },
          },
          Location: {
            select: {
              storeName: true,
              address: true,
            },
          },
          postId: true,
          imgUrl: true,
          content: true,
          likeCount: true,
          createdAt: true,
          star: true,
        },
        orderBy: { postId: 'desc' },
        skip: startIndex,
        take: parsedPageSize,
        where: skipCondition,
      });

      if (!posts) {
        return res.status(400).json({ message: '존재하지 않는 게시글입니다.' });
      }

      // 이미지 배열로 반환하는 로직
      const imgUrlsArray = posts.map((post) => post.imgUrl.split(','));
      const paramsArray = imgUrlsArray.map((urls) =>
        urls.map((url) => ({
          Bucket: bucketName,
          Key: url,
        }))
      );

      const signedUrlsArray = await Promise.all(
        paramsArray.map(async (params) => {
          const commands = params.map((param) => new GetObjectCommand(param));
          const urls = await Promise.all(commands.map((command) => getSignedUrl(s3, command, { expiresIn: 3600 })));
          return urls;
        })
      );

      for (let i = 0; i < posts.length; i++) {
        posts[i].imgUrl = signedUrlsArray[i];
      }

      const responseData = { data: posts, pagination: { page: parsedPage, pageSize: parsedPageSize, totalPosts, totalPage } };
      
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});