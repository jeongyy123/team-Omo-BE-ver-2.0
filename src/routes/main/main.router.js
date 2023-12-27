import express from "express";
import multer from "multer";
import { prisma } from "../../utils/prisma/index.js";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from "dotenv";

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

// 자치구에 해당하는 장소정보 조회 함수
function checkAddress(districtName) {
  const findDistrict = prisma.districts.findFirst({
    where: { districtName },
  });

  if (!findDistrict) {
    return res.status(400).json({ message: "존재하지않는 자치구입니다." });
  }

  const findLocations = prisma.locations.findMany({
    where: { DistrictId: findDistrict.districtId },
  });

  if (!findLocations || findLocations.length === 0) {
    return res.status(400).json({ message: "존재하지않는 주소입니다." });
  }
  return findLocations;
}

/**
 * @swagger
 * paths:
 *  /main/popular:
 *    get:
 *      summary: 인기글을 조회합니다.
 *      description: 자치구별, 좋아요 3개 이상, 작성일 기준 최신순으로 정렬된 인기글을 조회하는 API입니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 게시글의 최대 개수
 *          required: true
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *      responses:
 *        '200':
 *          description: 인기글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시글의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시글의 내용
 *                    Location:
 *                      type: object
 *                      properties:
 *                        locationId:
 *                          type: number
 *                          description: 게시글이 연결된 가게의 locationId
 *                        storeName:
 *                          type: string
 *                          description: 게시글이 연결된 가게의 이름
 *                        latitude:
 *                          type: number
 *                          format: double
 *                          description: 게시글이 연결된 가게의 위도
 *                        longitude:
 *                          type: number
 *                          format: double
 *                          description: 게시글이 연결된 가게의 경도
 *                        address:
 *                          type: string
 *                          description: 게시글이 연결된 가게의 주소
 *                        starAvg:
 *                          type: number
 *                          description: 게시글이 연결된 가게의 평균 별점
 *                        postCount:
 *                          type: number
 *                          description: 가게에 달린 게시글의 개수
 *                    Category:
 *                      type: object
 *                      properties:
 *                        categoryName:
 *                          type: string
 *                          description: 게시글이 있는 장소의 카테고리 이름
 *        '400':
 *          description: 조회된 인기글이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 인기글이 없어요
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

/* 인기글 조회 */
// 자치구별 / 좋아요 20개이상 / 작성일 기준 최신순
router.get("/main/popular", async (req, res, next) => {
  try {
    const { districtName, limit } = req.query;

    const findDistrict = await prisma.districts.findFirst({
      where: { districtName },
    });

    const findPosts = await prisma.posts.findMany({
      where: {
        Location: {
          ...(findDistrict?.districtId && {
            DistrictId: findDistrict.districtId,
          }),
        },
        likeCount: {
          gte: 3,
        },
      },
      select: {
        imgUrl: true,
        content: true,
        Location: {
          select: {
            locationId: true,
            storeName: true,
            latitude: true,
            longitude: true,
            address: true,
            starAvg: true,
            postCount: true,
            placeInfoId: true,
          },
        },
        Category: {
          select: {
            categoryName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: +limit,
    });

    if (!findPosts || findPosts === 0) {
      return res.status(400).json({ message: "해당 인기글이 없어요" });
    }

    //이미지 반환하는 로직
    const imgUrlsArray = findPosts.map((post) => post.imgUrl.split(","));
    const paramsArray = imgUrlsArray.map((urls) => {
      return urls.map((url) => ({
        Bucket: bucketName,
        Key: url,
      }));
    });

    const signedUrlsArray = await Promise.all(
      paramsArray.map(async (params) => {
        const commands = params.map((param) => new GetObjectCommand(param));
        const urls = await Promise.all(
          commands.map((command) =>
            getSignedUrl(s3, command),
          ),
        );
        return urls;
      }),
    );

    for (let i = 0; i < findPosts.length; i++) {
      findPosts[i].imgUrl = signedUrlsArray[i];
    }

    return res.status(200).json(findPosts);
  } catch (error) {
    next(error);
    console.log(error);
  }
});

/**
 * @swagger
 * paths:
 *  /main/recent:
 *    get:
 *      summary: 최신글을 조회합니다.
 *      description: 자치구별, 카테고리별 최신순으로 정렬된 게시글을 조회하는 API입니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 게시글의 최대 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *        - name: categoryName
 *          in: query
 *          description: 조회할 카테고리의 이름
 *          required: false
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 최신글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    postId:
 *                      type: number
 *                      description: 게시글 postId
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시글의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시글의 내용
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 게시글 생성일시
 *                    likeCount:
 *                      type: number
 *                      description: 게시글의 좋아요 수
 *                    commentCount:
 *                      type: number
 *                      description: 게시글의 댓글 수
 *                    User:
 *                      type: object
 *                      properties:
 *                        nickname:
 *                          type: string
 *                          description: 게시글 작성자의 닉네임
 *        '400':
 *          description: 조회된 최신글이 없는 경우 또는 잘못된 limit 값이 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 최신글이 없어요 또는 limit값을 입력해주세요
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

/* 최신글 조회 */
// 자치구별 최신순 게시물
router.get("/main/recent", async (req, res, next) => {
  try {
    const { districtName, limit, categoryName } = req.query;

    const findLocations = await checkAddress(districtName);

    const parsedLimit = +limit || 9;

    if (!parsedLimit || parsedLimit <= 0) {
      return res.status(400).json({ message: "limit값을 입력해주세요" });
    }

    const category = await prisma.categories.findFirst({
      where: { categoryName },
    });

    const findPosts = await prisma.posts.findMany({
      where: {
        ...(findLocations?.locationId && {
          LocationId: findLocations.locationId,
        }),
        ...(category?.categoryId && { CategoryId: category.categoryId }),
        Location: {
          ...(districtName && {
            District: {
              districtName,
            },
          }),
        },
      },
      select: {
        postId: true,
        imgUrl: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        User: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: +limit,
    });

    if (!findPosts || findPosts === 0) {
      return res.status(400).json({ message: "해당 최신글이 없어요" });
    }

    //이미지 반환하는 로직
    const imgUrlsArray = findPosts.map((post) => post.imgUrl.split(","));
    const paramsArray = imgUrlsArray.map((urls) => {
      return urls.map((url) => ({
        Bucket: bucketName,
        Key: url,
      }));
    });

    const signedUrlsArray = await Promise.all(
      paramsArray.map(async (params) => {
        const commands = params.map((param) => new GetObjectCommand(param));
        const urls = await Promise.all(
          commands.map((command) => getSignedUrl(s3, command)),
        );
        return urls;
      }),
    );

    for (let i = 0; i < findPosts.length; i++) {
      findPosts[i].imgUrl = signedUrlsArray[i];
    }

    return res.status(200).json(findPosts);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * paths:
 *  /main/comments:
 *    get:
 *      summary: 댓글을 조회합니다.
 *      description: 자치구별로 최신순으로 정렬된 댓글을 조회하는 API입니다.
 *      tags:
 *        - Main
 *      parameters:
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: limit
 *          in: query
 *          description: 조회할 댓글의 최대 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 100
 *      responses:
 *        '200':
 *          description: 댓글을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    content:
 *                      type: string
 *                      description: 댓글 내용
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 댓글 생성일시
 *                    PostId:
 *                      type: number
 *                      description: 댓글이 연결된 게시글 postId
 *                    Post:
 *                      type: object
 *                      properties:
 *                        Location:
 *                          type: object
 *                          properties:
 *                            address:
 *                              type: string
 *                              description: 게시글이 연결된 위치의 주소
 *        '400':
 *          description: 조회된 댓글이 없는 경우 또는 잘못된 limit 값이 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 해당 댓글이 없어요 또는 limit값을 입력해주세요
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

/* 댓글 조회 */
router.get("/main/comments", async (req, res, next) => {
  try {
    const { districtName, limit } = req.query;

    const findDistrict = await prisma.districts.findFirst({
      where: { districtName },
    });

    const findComments = await prisma.comments.findMany({
      where: {
        ...(findDistrict?.districtId && {
          Post: {
            Location: {
              DistrictId: findDistrict.districtId,
            },
          },
        }),
      },
      select: {
        content: true,
        createdAt: true,
        PostId: true,
        Post: {
          select: {
            Location: {
              select: {
                address: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: +limit,
    });

    if (!findComments) {
      return res.status(400).json({ message: "해당 댓글이 없어요." });
    }

    return res.status(200).json(findComments);
  } catch (error) {
    next(error);
  }
});

export default router;
