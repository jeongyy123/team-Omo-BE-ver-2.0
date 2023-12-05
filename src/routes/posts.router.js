import express from "express";
import multer from "multer";
import { prisma } from "../utils/prisma/index.js";

import {
  S3Client,
  PutObjectCommand,
  GetObjectAclCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";
import crypto from "crypto";

const router = express.Router();

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

/* 게시물 작성 */
router.post("/posts", upload.array("imgUrl", 5), async (req, res, next) => {
  try {
    const {
      content,
      likeCount,
      categoryName,
      storeName,
      address,
      latitude,
      longitude,
    } = req.body;
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

    const districtName = address.split(" ")[1];

    const district = await prisma.districts.findFirst({
      where: { districtName }
    });

    if (!district) {
      return res.status(400).json({ message: "지역이 존재하지 않습니다." });
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

    // location 생성
    const location = await prisma.locations.create({
      data: {
        storeName,
        address,
        latitude,
        longitude,
        starAvg: 1,
        Category: { connect: { categoryId: +category.categoryId } },
        User: { connect: { userId: +user.userId } },
        District: { connect: { districtId: +district.districtId } },
      },
    });

    // posts 생성
    const post = await prisma.posts.create({
      data: {
        content,
        likeCount: +likeCount,
        User: { connect: { userId: +user.userId } },
        Category: { connect: { categoryId: +category.categoryId } },
        Location: { connect: { locationId: +location.locationId } },
        imgUrl: imgNames.join(","),
      },
    });

    return res.status(200).json([post]);
  } catch (error) {
    console.log("error", error);
  }
});

/* 게시물 조회 */
router.get("/posts", async (req, res, next) => {

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
  });

  for (const post of posts) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: post.imgUrl,
    };
    const command = new GetObjectAclCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    post.imgUrl = url;
  }

  return res.status(200).json([posts]);
});

