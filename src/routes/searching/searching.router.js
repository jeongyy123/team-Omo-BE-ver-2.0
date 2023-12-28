import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import { searchingSchema } from "../../validations/searching.validation.js";
import {
  getManyImagesS3,
  getImageS3,
  getProfileImageS3,
} from "../../utils/getImageS3.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
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

/**
 * @swagger
 * paths:
 *  /posts/main/searching:
 *    get:
 *      summary: 유저 또는 가게 이름을 검색합니다.
 *      description: 유저 또는 가게 이름으로 검색하여 결과를 반환하는 API입니다.
 *      tags:
 *        - Searching
 *      parameters:
 *        - name: nickname
 *          in: query
 *          description: 검색하려는 유저의 닉네임
 *          required: false
 *          schema:
 *            type: string
 *        - name: storeName
 *          in: query
 *          description: 검색하려는 가게의 이름
 *          required: false
 *          schema:
 *            type: string
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: 검색 결과를 성공적으로 반환한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    nickname:
 *                      type: string
 *                      example: 유저 닉네임
 *                    imgUrl:
 *                      type: string
 *                      format: uri
 *                      example: "https://example.com/user-profile.jpg"
 *                    storeName:
 *                      type: string
 *                      example: 가게 이름
 *                    address:
 *                      type: string
 *                      example: 서울시 강남구 가로수길 123
 *                    starAvg:
 *                      type: number
 *                      example: 4.5
 *                    Posts:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          imgUrl:
 *                            type: string
 *                            format: uri
 *                            example: "https://example.com/post-image.jpg"
 *                          content:
 *                            type: string
 *                            example: 게시물 내용
 *                          likeCount:
 *                            type: number
 *                            example: 10
 *                          commentCount:
 *                            type: number
 *                            example: 5
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                            example: 2023-01-01T12:00:00Z
 *        '400':
 *          description: 요청이 잘못된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: nickname 또는 storeName 둘 중 하나만 입력해주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 검색에서 에러가 발생했습니다.
 */

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
      return res
        .status(400)
        .json({
          message: "nickname 또는 storeName 둘 중 하나만 입력해주세요.",
        });
    }

    let resultData;
    if (nickname) {
      const users = await prisma.users.findMany({
        select: {
          nickname: true,
          imgUrl: true,
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
