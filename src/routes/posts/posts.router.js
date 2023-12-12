import express from "express";
import multer from "multer";
import { prisma } from "../../utils/prisma/index.js";
import { createPosts } from "../../validations/posts.validation.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
import crypto from "crypto";
import redis from "redis";

const router = express.Router();
const redisClient = redis.createClient();
await redisClient.connect();

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

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

/* 게시물 목록 조회 */
// 자치구 카테고리 선택 시 -> 조회 (없으면 전 자치구 조회)
// (음식점, 카페, 기타) 카테고리 선택시 -> 조회 (없으면 전체 카테고리 조회)
router.get("/posts", async (req, res, next) => {
  try {
    const { page, pageSize, lastSeenPage, categoryName, districtName } =
      req.query;

    const findCategory = await prisma.categories.findFirst({
      where: { categoryName },
    });

    const findDistrict = await prisma.districts.findFirst({
      where: { districtName },
    });

    //🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎
    //레디스에 데이터가 있으면 전달하고,
    //없으면 db에서 전달하고, 레디스에 저장
    redisClient.get('2', '하하');
    console.log("레디스 get 바로 밑")

    redisClient.set('example_key', 'Hello, Redis!', (err, reply) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
      }
      res.send('Data stored in Redis!');
    });
    const parsedPage = +page;
    const parsedPageSize = +pageSize;
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;


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
            starAvg: true,
          },
        },
        postId: true,
        imgUrl: true,
        content: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
      },
      orderBy: { postId: "desc" },
      skip: parsedPage,
      take: parsedPageSize,
      where: {
        ...(findCategory?.categoryId && {
          CategoryId: findCategory.categoryId,
        }),
        ...(findDistrict?.districtId && {
          Location: { DistrictId: findDistrict.districtId },
        }),
        updatedAt: {
          lt: new Date(),
        },
      },
    });

    if (!posts) {
      return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
    }

    function latestPostsPage(page, pageSize) {
      const posts = prisma.posts.findMany({
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
        orderBy: { postId: "desc" },
        where: {
          updatedAt: {
            lt: new Date(),
          },
          postId: {
            lt: (page - 1) * pageSize,
          },
        },
      });
      return posts.postId;
    }

    const data = latestPostsPage(page, pageSize);
    // 이미지 배열로 반환하는 로직
    const imgUrlsArray = posts.map((post) => post.imgUrl.split(","));
    const paramsArray = imgUrlsArray.map((urls) =>
      urls.map((url) => ({
        Bucket: bucketName,
        Key: url,
      })),
    );

    const signedUrlsArray = await Promise.all(
      paramsArray.map(async (params) => {
        const commands = params.map((param) => new GetObjectCommand(param));
        const urls = await Promise.all(
          commands.map((command) => getSignedUrl(s3, command)),
        );
        return urls;
      }),
    );

    for (let i = 0; i < posts.length; i++) {
      posts[i].imgUrl = signedUrlsArray[i];
    }

    const responseData = {
      data: posts,
      data2: data,
      pagination: { page: parsedPage, pageSize: parsedPageSize },
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "서버가 닫혔습니다." });
  }
});

/* 게시글 상세 조회 - 1개 */
router.get("/posts/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;

    const posts = await prisma.posts.findFirst({
      where: { postId: +postId },
      select: {
        postId: true,
        content: true,
        createdAt: true,
        likeCount: true,
        imgUrl: false,
        User: {
          select: {
            nickname: true,
          },
        },
        Location: {
          select: {
            address: true,
            starAvg: true,
          },
        },
        Comments: {
          select: {
            content: true,
          },
        },
      },
    });

    if (!posts) {
      return res.status(400).json({ message: "존재하지않는 게시물입니다." });
    }

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/* 게시물 작성 */
//auth.middleware 추가로 넣기
router.post(
  "/posts",
  // authMiddleware,
  upload.array("imgUrl", 5),
  async (req, res, next) => {
    try {
      const validation = await createPosts.validateAsync(req.body);
      const {
        content,
        likeCount,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
      } = validation;
      // const { userId } = req.user; //auth.middleware 넣으면 주석 해제하기
      const userId = 6;

      const user = await prisma.users.findFirst({
        where: { userId },
      });

      if (!user) {
        return res.status(400).json({ message: "유저가 존재하지 않습니다." });
      }

      const category = await prisma.categories.findFirst({
        where: { categoryName },
      });

      if (!category) {
        return res
          .status(400)
          .json({ message: "카테고리가 존재하지 않습니다." });
      }

      const districtName = address.split(" ")[1];

      const district = await prisma.districts.findFirst({
        where: { districtName },
      });

      if (!district) {
        return res.status(400).json({ message: "지역이 존재하지 않습니다." });
      }

      // 같은 장소에 한 사람이 여러 개의 포스팅 올리지 않도록 하기
      const findPosts = await prisma.posts.findFirst({
        where: {
          UserId: userId,
          Location: {
            is: {
              address,
            },
          },
        },
      });

      if (findPosts) {
        return res.status(400).json({
          message: "이미 같은 장소에 대한 유저의 포스팅이 존재합니다.",
        });
      }

      //이미지 이름 나눠서 저장
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

      const location = await prisma.locations.findFirst({
        where: { address },
      });

      //location 정보가 기존 X => location랑 posts 생성.
      if (!location) {
        const createLocation = await prisma.locations.create({
          data: {
            storeName,
            address,
            latitude,
            longitude,
            starAvg: 0,
            Category: { connect: { categoryId: +category.categoryId } },
            District: { connect: { districtId: +district.districtId } },
            User: { connect: { userId: +user.userId } },
          },
        });

        await prisma.posts.create({
          data: {
            content,
            likeCount: +likeCount,
            star,
            User: { connect: { userId: +user.userId } },
            Category: { connect: { categoryId: +category.categoryId } },
            Location: { connect: { locationId: +createLocation.locationId } },
            imgUrl: imgNames.join(","),
          },
        });
      }
      //location 정보가 기존 O => location 업데이트, posts 생성
      await prisma.$transaction(async (prisma) => {
        await prisma.posts.create({
          data: {
            content,
            likeCount: +likeCount,
            star,
            User: { connect: { userId: +user.userId } },
            Category: { connect: { categoryId: +category.categoryId } },
            Location: { connect: { locationId: +location.locationId } },
            imgUrl: imgNames.join(","),
          },
        });

        const starsAvg = await prisma.posts.aggregate({
          where: { LocationId: location.locationId },
          _avg: {
            star: true,
          },
        });

        await prisma.locations.update({
          where: {
            locationId: location.locationId,
          },
          data: {
            starAvg: starsAvg._avg.star,
          },
        });
      });

      return res.status(200).json({ message: "게시글 등록이 완료되었습니다." });
    } catch (error) {
      throw new Error("트랜잭션 실패");
      next(error);
    }
  },
);

// 게시물 수정
router.patch("/posts/:postId", async (req, res, next) => {
  //auth.middleware 추가로 넣기
  try {
    // const { userId } = req.user;
    const userId = 4;
    const { postId } = req.params;
    const { address, content, star, storeName } = req.body;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    if (!post) {
      res.status(404).json({ message: "존재하지 않는 게시글 입니다." });
    }
    await prisma.locations.update({
      where: { locationId: post.LocationId },
      data: { address },
    });

    await prisma.posts.update({
      where: { postId: +postId },
      data: { content, star, storeName },
    });
    return res.status(200).json({ message: "게시물을 수정하였습니다." });
  } catch (error) {
    next(error);
  }
});

// 게시물 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });
    if (!post) {
      return res.status(404).json({ message: "존재하지 않는 게시글 입니다." });
    }
    if (post.UserId !== userId) {
      return res
        .status(404)
        .json({ message: "삭제할 권한이 존재하지 않습니다." });
    }
    const imgUrlsArray = post.imgUrl.split(",");

    const params = imgUrlsArray.map((url) => {
      return {
        Bucket: bucketName,
        Key: url,
      };
    });

    params.map((bucket) => {
      return s3.send(new DeleteObjectCommand(bucket));
    });

    await prisma.posts.delete({
      where: { postId: +postId },
    });
    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;
