import express from "express";
import multer from "multer";
import { prisma } from "../../utils/prisma/index.js";
import { createPosts } from '../../validation/joi.error.handler.js';

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
            imgUrl: true
          }
        },
        Location: {
          select: {
            storeName: true,
            address: true,
            starAvg: true
          }
        },
        imgUrl: true,
        content: true,
        likeCount: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    if (!posts) { //추가
      return res.status(400).json({ message: "존재하지 않는 게시글입니다." })
    }

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
    next(error); //추가
  }
});

/* 게시물 작성 */
router.post("/posts", upload.array("imgUrl", 5), async (req, res, next) => {
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
    } = validation;
    const nickname = "김아무개";

    const user = await prisma.users.findFirst({
      where: { nickname },
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
        // starAvg: 1, // 추가 수정
        Category: { connect: { categoryId: +category.categoryId } },
        // User: { connect: { userId: +user.userId } }, // 추가 수정
        District: { connect: { districtId: +district.districtId } },
      },
    });


    const posts = await prisma.posts.create({
      data: {
        content,
        likeCount: +likeCount,
        User: { connect: { userId: +user.userId } },
        Category: { connect: { categoryId: +category.categoryId } },
        Location: { connect: { locationId: +location.locationId } },
        imgUrl: imgNames.join(","),
      },
    });

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error)
    next(error);
  }
});

export default router;
