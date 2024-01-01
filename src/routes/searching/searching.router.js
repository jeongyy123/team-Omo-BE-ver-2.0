import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import { searchingSchema } from "../../validations/searching.validation.js";
import { getManyImagesS3 } from "../../utils/getImageS3.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

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

/* 검색 기능 (유저, 가게 이름) */
router.get("/posts/main/searching", async (req, res, next) => {
  try {
    const validation = await searchingSchema.validateAsync(req.body);
    const { nickname, storeName } = validation;

    if (!nickname && !storeName) {
      return res
        .status(400)
        .json({ message: "nickname 또는 storeName을 입력해주세요." });
    }

    if (nickname && storeName) {
      return res.status(400).json({
        message: "nickname 또는 storeName 둘 중 하나만 입력해주세요.",
      });
    }

    let resultData;
    if (nickname) {
      const users = await prisma.users.findMany({
        select: {
          nickname: true,
          imgUrl: true,
          // Posts: {
          //   select: {
          //     content: true,
          //     imgUrl: true,
          //     likeCount: true,
          //     commentCount: true,
          //     star: true,
          //     createdAt: true
          //   }
          // }
        },
        where: {
          nickname: {
            contains: nickname,
          },
        },
      });

      if (!users || users.length === 0) {
        return res
          .status(400)
          .json({ message: "검색하신 유저의 정보가 없어요." });
      }

      resultData = users;

      await getManyImagesS3(resultData);
    }

    if (storeName) {
      const stores = await prisma.locations.findMany({
        where: {
          storeName: {
            contains: storeName,
          },
        },
        select: {
          storeName: true,
          address: true,
          starAvg: true,
          Posts: {
            select: {
              imgUrl: true,
              content: true,
              likeCount: true,
              commentCount: true,
              createdAt: true,
            },
            take: 1,
          },
          User: {
            select: {
              nickname: true,
            },
          },
        },
      });

      if (!stores || stores.length === 0) {
        return res
          .status(400)
          .json({ message: "검색하신 가게 정보가 없어요." });
      }
      resultData = stores;
    }

    console.log("resultData >>>>>>>>>>> ", resultData);
    const imgUrlsArray = resultData.map((arr) =>
      arr.Posts[0].imgUrl.split(","),
    );
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

    for (let i = 0; i < resultData.length; i++) {
      resultData[i].Posts[0].imgUrl = signedUrlsArray[i];
    }

    return res.status(200).json(resultData);
  } catch (error) {
    next(error);
  }
});

export default router;
