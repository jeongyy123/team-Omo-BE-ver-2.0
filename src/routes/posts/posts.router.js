import express from "express";
import multer from "multer";
import { prisma } from "../../utils/prisma/index.js";
import { createPosts } from '../../validation/joi.error.handler.js';
import authMiddleware from '../../middlewares/auth.middleware.js'

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

/* 게시물 상세 조회 */
router.get("/posts", async (req, res, next) => {
  try {
    const posts = await prisma.posts.findMany({
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true
          }
        },
        Location: {
          select: {
            storeName: true,
            address: true,
          },
        },
        imgUrl: true,
        content: true,
        likeCount: true,
        createdAt: true,
        star: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (!posts) {
      return res.status(400).json({ message: "존재하지 않는 게시글입니다." })
    }

    //이미지 배열로 반환하는 로직
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
    next(error);
  }
});

/* 게시물 작성 */
router.post("/posts", authMiddleware, upload.array("imgUrl", 5), async (req, res, next) => {
  try {
    const validation = await createPosts.validateAsync(req.body);
    const {
      content, likeCount, categoryName, storeName, address, latitude, longitude, star } = validation;
    const { userId } = req.user;

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
      return res.status(400).json({ message: "카테고리가 존재하지 않습니다." });
    }

    const districtName = address.split(" ")[1];

    const district = await prisma.districts.findFirst({
      where: { districtName }
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
            address
          }
        }
      }
    })

    if (findPosts) {
      return res.status(400).json({ message: "이미 같은 장소에 대한 유저의 포스팅이 존재합니다." })
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
      where: { address }
    });

    //트랜잭션 일괄처리 필요
    const createLocation = await prisma.locations.create({
      data: {
        storeName,
        address,
        latitude,
        longitude,
        starAvg: 1,
        Category: { connect: { categoryId: +category.categoryId } },
        District: { connect: { districtId: +district.districtId } },
        User: { connect: { userId: +user.userId } }
      },
    });

    const posts = await prisma.posts.create({
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

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

/* 게시글 목록 조회*/
//
router.get('/posts/star', async (req, res, next) => {
  try {
    const { page, pageSize } = req.query;

    const parsedPage = +page || 1;
    const parsedPageSize = +pageSize || 10;
    //로직은 나중에 프론트 요구사항 확인 후 조정
    const startIndex = (parsedPage - 1) * parsedPageSize;
    const endIndex = startIndex + parsedPageSize;

    const posts = await prisma.posts.findMany({
      select: {
        postId: true,
        content: true,
        createdAt: true,
        likeCount: true,
        imgUrl: false,
        User: {
          select: {
            nickname: true,
          }
        },
        Location: {
          select: {
            address: true
          }
        },
        Comments: {
          select: {
            content: true //이게 개수로 보여야한다.
          }
        }
      },
      skip: startIndex, //skip+1번째부터 take 개수만큼 조회
      take: endIndex,
    });

    return res.status(200).json(posts)
  } catch (error) {
    next(error)
  }
})


export default router;
