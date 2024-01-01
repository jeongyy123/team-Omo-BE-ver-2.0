import express from "express";
import multer from "multer";
import jimp from "jimp";
import { prisma } from "../../utils/prisma/index.js";
import { createPostsSchema, editPostsSchema } from "../../validations/posts.validation.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  getImageS3,
  getManyImagesS3,
  getSingleImageS3,
  getProfileImageS3,
  getRepliesImageS3,
} from "../../utils/getImageS3.js";
import { fileFilter } from "../../utils/putImageS3.js";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import crypto from "crypto";
// // 💥💥💥 redis 주석처리하기 💥💥💥
// import { setCheckCache, getChckeCache } from "../../middlewares/cache.middleware.js";
// import Redis from 'ioredis';

const router = express.Router();

dotenv.config();

// // 💥💥💥 redis 주석처리하기 💥💥💥
// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD,
// });

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
const upload = multer({ storage: storage, fileFilter });

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

/**
 * @swagger
 * paths:
 *  /posts:
 *    get:
 *      summary: 게시물 목록을 조회합니다.
 *      description: 페이지네이션을 사용하여 게시물 목록을 조회하는 API입니다. 카테고리별, 자치구별로 필터링할 수 있습니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: page
 *          in: query
 *          description: 조회할 페이지 개수
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *        - name: lastSeenPage
 *          in: query
 *          description: 이전 조회했던 페이지의 마지막 게시물 ID
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *        - name: categoryName
 *          in: query
 *          description: 조회할 카테고리의 이름
 *          required: false
 *          schema:
 *            type: string
 *        - name: districtName
 *          in: query
 *          description: 조회할 자치구의 이름
 *          required: false
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 게시물 목록을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    User:
 *                      type: object
 *                      properties:
 *                        nickname:
 *                          type: string
 *                          description: 게시물 작성자의 닉네임
 *                    Category:
 *                      type: object
 *                      properties:
 *                        categoryName:
 *                          type: string
 *                          description: 게시물의 카테고리 이름
 *                    Location:
 *                      type: object
 *                      properties:
 *                        locationId:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 locationId
 *                        storeName:
 *                          type: string
 *                          description: 게시물이 연결된 장소의 가게 이름
 *                        address:
 *                          type: string
 *                          description: 게시물이 연결된 장소의 주소
 *                        starAvg:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 별점 평균
 *                        postCount:
 *                          type: number
 *                          description: 게시물이 연결된 장소의 게시물 수
 *                    postId:
 *                      type: number
 *                      description: 게시물 postId
 *                    imgUrl:
 *                      type: array
 *                      items:
 *                        type: string
 *                        format: uri
 *                      description: 게시물의 이미지 URL 목록
 *                    content:
 *                      type: string
 *                      description: 게시물의 내용
 *                    likeCount:
 *                      type: number
 *                      description: 게시물의 좋아요 수
 *                    commentCount:
 *                      type: number
 *                      description: 게시물의 댓글 수
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                      description: 게시물 생성일시
 *        '400':
 *          description: 잘못된 페이지 번호 또는 마지막 게시물 postId가 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 잘못된 페이지 번호 또는 마지막 게시물 postId가 주어졌습니다.
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

/* 게시물 목록 조회 */
router.get("/posts", async (req, res, next) => {
  try {
    const { page, lastSeenPage, categoryName, districtName } = req.query;

    const findCategory = categoryName
      ? await prisma.categories.findFirst({ where: { categoryName } })
      : null;
    const findDistrict = districtName
      ? await prisma.districts.findFirst({ where: { districtName } })
      : null;

    const parsedPage = parseInt(page, 10) || 1;

    const posts = await prisma.posts.findMany({
      select: {
        User: {
          select: {
            nickname: true,
          },
        },
        Category: {
          select: {
            categoryName: true,
          },
        },
        Location: {
          select: {
            locationId: true,
            storeName: true,
            address: true,
            starAvg: true,
            postCount: true,
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
      take: parsedPage,
      skip: lastSeenPage ? 1 : 0,
      ...(+lastSeenPage && { cursor: { postId: +lastSeenPage } }),
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

    await getManyImagesS3(posts);

    // const cacheKey = `posts:${categoryName || 'all'}:${districtName || 'all'}`; //키를 ZADD로 표현합세
    // await redis.set(cacheKey, JSON.stringify(posts));

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * paths:
 *  /posts/:postId:
 *    get:
 *      summary: 게시글 상세 정보를 조회합니다.
 *      description: 게시글의 상세 정보를 조회하는 API입니다. 게시글에 대한 모든 정보를 포함하며, 댓글과 댓글의 답글까지 모두 포함합니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 조회할 게시글의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            minimum: 1
 *      responses:
 *        '200':
 *          description: 게시글 상세 정보를 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  postId:
 *                    type: number
 *                    description: 게시글 postId
 *                  content:
 *                    type: string
 *                    description: 게시글 내용
 *                  createdAt:
 *                    type: string
 *                    format: date-time
 *                    description: 게시글 생성일시
 *                  likeCount:
 *                    type: number
 *                    description: 게시글 좋아요 수
 *                  commentCount:
 *                    type: number
 *                    description: 게시글 댓글 수
 *                  imgUrl:
 *                    type: array
 *                    items:
 *                      type: string
 *                      format: uri
 *                    description: 게시글의 이미지 URL 목록
 *                  star:
 *                    type: number
 *                    description: 게시글의 평점
 *                  User:
 *                    type: object
 *                    properties:
 *                      nickname:
 *                        type: string
 *                        description: 게시글 작성자의 닉네임
 *                      imgUrl:
 *                        type: string
 *                        format: uri
 *                        description: 게시글 작성자의 프로필 이미지 URL
 *                  Location:
 *                    type: object
 *                    properties:
 *                      locationId:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 locationId
 *                      address:
 *                        type: string
 *                        description: 게시글이 연결된 장소의 주소
 *                      storeName:
 *                        type: string
 *                        description: 게시글이 연결된 장소의 가게 이름
 *                      latitude:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 위도
 *                      longitude:
 *                        type: number
 *                        description: 게시글이 연결된 장소의 경도
 *                      postCount:
 *                        type: number
 *                        description: 게시글이 연결된 위치의 총 게시물 수
 *                      Category:
 *                        type: object
 *                        properties:
 *                          categoryId:
 *                            type: number
 *                            description: 게시글이 속한 카테고리의 categoryId
 *                          categoryName:
 *                            type: string
 *                            description: 게시글이 속한 카테고리의 이름
 *                  Comments:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        commentId:
 *                          type: number
 *                          description: 댓글 commentId
 *                        content:
 *                          type: string
 *                          description: 댓글 내용
 *                        createdAt:
 *                          type: string
 *                          format: date-time
 *                          description: 댓글 생성일시
 *                        User:
 *                          type: object
 *                          properties:
 *                            imgUrl:
 *                              type: string
 *                              format: uri
 *                              description: 댓글 작성자의 프로필 이미지 URL
 *                            nickname:
 *                              type: string
 *                              description: 댓글 작성자의 닉네임
 *                        Replies:
 *                          type: array
 *                          items:
 *                            type: object
 *                            properties:
 *                              replyId:
 *                                type: number
 *                                description: 답글 replyId
 *                              content:
 *                                type: string
 *                                description: 답글 내용
 *                              createdAt:
 *                                type: string
 *                                format: date-time
 *                                description: 답글 생성일시
 *                              User:
 *                                type: object
 *                                properties:
 *                                  imgUrl:
 *                                    type: string
 *                                    format: uri
 *                                    description: 답글 작성자의 프로필 이미지 URL
 *                                  nickname:
 *                                    type: string
 *                                    description: 답글 작성자의 닉네임
 *        '400':
 *          description: 존재하지 않는 게시글 식별자가 주어진 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글입니다.
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
        commentCount: true,
        imgUrl: true,
        star: true,
        User: {
          select: {
            userId: true,
            nickname: true,
            imgUrl: true,
          },
        },
        Location: {
          select: {
            locationId: true,
            address: true,
            storeName: true,
            latitude: true,
            longitude: true,
            postCount: true,
            placeInfoId: true,
            Category: {
              select: {
                categoryId: true,
                categoryName: true,
              },
            },
          },
        },
        Comments: {
          select: {
            commentId: true,
            content: true,
            createdAt: true,
            User: {
              select: {
                userId: true,
                imgUrl: true,
                nickname: true,
              },
            },
            Replies: {
              select: {
                replyId: true,
                content: true,
                createdAt: true,
                User: {
                  select: {
                    userId: true,
                    imgUrl: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!posts) {
      return res.status(400).json({ message: "존재하지않는 게시글입니다." });
    }

    await getRepliesImageS3(posts.Comments);
    await getProfileImageS3(posts.Comments);
    await getSingleImageS3(posts.User);
    await getImageS3(posts);

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * paths:
 *  /posts:
 *    post:
 *      summary: 게시물을 작성합니다.
 *      description: 사용자가 게시물을 작성하는 API입니다. 게시물 내용, 이미지, 위치 등의 정보를 포함합니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: body
 *          in: body
 *          description: 게시물 작성에 필요한 정보들을 담은 객체
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                description: 게시물 내용
 *              categoryName:
 *                type: string
 *                description: 게시물이 속한 카테고리의 이름
 *              storeName:
 *                type: string
 *                description: 가게 이름
 *              address:
 *                type: string
 *                description: 가게의 주소
 *              latitude:
 *                type: number
 *                description: 가게의 위도
 *              longitude:
 *                type: number
 *                description: 가게의 경도
 *              star:
 *                type: number
 *                description: 게시물에 대한 별점
 *      consumes:
 *        - multipart/form-data
 *      produces:
 *        - application/json
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                imgUrl:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *                  description: 게시물에 첨부된 이미지 파일들
 *      responses:
 *        '201':
 *          description: 게시물이 성공적으로 작성되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 등록이 완료되었습니다.
 *        '400':
 *          description: 요청이 유효하지 않거나 필수 정보가 누락된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 사진을 등록해주시고, 사진을 50KB이하의 사진파일만 넣어주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 작성에 실패했습니다.
 */

/* 게시물 작성 */
router.post(
  "/posts",
  authMiddleware,
  upload.array("imgUrl", 5),
  async (req, res, next) => {
    try {
      const validation = await createPostsSchema.validateAsync(req.body);
      const {
        content,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
        placeInfoId
      } = validation;
      const { userId } = req.user;

      const category = await prisma.categories.findFirst({
        where: { categoryName },
      });
      console.log("address>>>>>>>>>", address)
      console.log("address>>>>>>>>>", address.split(" ")[1].trim())

      const a = address.split(" ")[1]

      const district = await prisma.districts.findFirst({
        where: { districtName: a},
      });

      console.log("district>>>>>>", district)

      if (!district) {
        return res.status(400).json({ message: "지역이 존재하지 않습니다." });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "사진을 등록해주세요." });
      }

      //이미지 이름 나눠서 저장
      const imgPromises = req.files.map(async (file) => {
        if (file.size > 6000000) { // 1500000 
          return res.status(400).json({ message: "3MB이하의 이미지파일만 넣어주세요." })
        }

        const imgName = randomImgName();

        // 이미지 사이즈 조정
        const buffer = await jimp
          .read(file.buffer)
          .then((image) =>
            image
              .resize(jimp.AUTO, 500)
              .quality(70)
              .getBufferAsync(jimp.MIME_JPEG),
          );

        const params = {
          Bucket: bucketName,
          Key: imgName,
          Body: buffer,
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
        await prisma.$transaction(async (prisma) => {
          const createLocation = await prisma.locations.create({
            data: {
              storeName,
              address,
              latitude,
              longitude,
              starAvg: star || 0,
              postCount: 1,
              placeInfoId,
              Category: { connect: { categoryId: +category.categoryId } },
              District: { connect: { districtId: +district.districtId } },
              User: { connect: { userId: +userId } },
            },
          });

          await prisma.posts.create({
            data: {
              content,
              star,
              likeCount: 0,
              User: { connect: { userId: +userId } },
              Category: { connect: { categoryId: +category.categoryId } },
              Location: {
                connect: { locationId: +createLocation.locationId },
              },
              imgUrl: imgNames.join(","),
            },
          });
        });
      } else {
        //location 정보가 기존 O => location 업데이트, posts 생성
        await prisma.$transaction(async (prisma) => {
          await prisma.posts.create({
            data: {
              content,
              star,
              likeCount: 0,
              User: { connect: { userId: +userId } },
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
              postCount: {
                increment: 1,
              },
            },
          });
        });
      }

      return res.status(201).json({ message: "게시글 등록이 완료되었습니다." });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * paths:
 *  /posts/:postId:
 *    patch:
 *      summary: 게시물을 수정합니다.
 *      description: 사용자가 자신의 게시물을 수정하는 API입니다. 게시물의 내용, 주소, 가게 이름, 별점 등을 수정할 수 있습니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 수정하려는 게시물의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            format: int64
 *        - name: body
 *          in: body
 *          description: 수정할 정보를 담은 객체
 *          required: true
 *          schema:
 *            type: object
 *            properties:
 *              address:
 *                type: string
 *                description: 수정된 주소
 *              content:
 *                type: string
 *                description: 수정된 게시물 내용
 *              star:
 *                type: number
 *                description: 수정된 별점
 *              storeName:
 *                type: string
 *                description: 수정된 가게 이름
 *      produces:
 *        - application/json
 *      responses:
 *        '201':
 *          description: 게시물이 성공적으로 수정되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시물을 수정하였습니다.
 *        '403':
 *          description: 게시글에 수정 권한이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 수정할 권한이 존재하지 않습니다.
 *        '404':
 *          description: 요청한 게시물이 존재하지 않는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글 입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 수정에서 에러가 발생했습니다.
 */

// 게시물 수정
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const validation = await editPostsSchema.validateAsync(req.body)
    const { address, content, star, storeName, placeInfoId } = validation;
    // 확인사항: 주소를 바꾸는 경우에는 latitude, longitude, placeInfoId도 받아서 같이 수정해야함
    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    if (!post) {
      res.status(404).json({ message: "존재하지 않는 게시글 입니다." });
    }

    if (post.UserId !== userId) {
      return res
        .status(403)
        .json({ message: "삭제할 권한이 존재하지 않습니다." });
    }

    await prisma.$transaction(async (prisma) => {
      const createPost = await prisma.posts.update({
        where: { postId: +postId, UserId: +userId },
        data: {
          content,
          star,
        },
      });

      const starAvg = await prisma.posts.aggregate({
        where: { LocationId: createPost.LocationId },
        _avg: {
          star: true,
        },
      });

      await prisma.locations.update({
        where: {
          locationId: createPost.LocationId,
        },
        data: {
          starAvg: starAvg._avg.star,
          address,
          storeName,
          placeInfoId
        },
      });
    });

    return res.status(201).json({ message: "게시물을 수정하였습니다." });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * paths:
 *  /posts/:postId:
 *    delete:
 *      summary: 게시물을 삭제합니다.
 *      description: 사용자가 자신의 게시물을 삭제하는 API입니다. 게시물을 삭제할 때 해당 게시물에 첨부된 이미지도 함께 삭제됩니다.
 *      tags:
 *        - Posts
 *      parameters:
 *        - name: postId
 *          in: path
 *          description: 삭제하려는 게시물의 postId
 *          required: true
 *          schema:
 *            type: integer
 *            format: int64
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: 게시물이 성공적으로 삭제되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글을 삭제하였습니다.
 *        '403':
 *          description: 게시글에 삭제 권한이 없는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 삭제할 권한이 존재하지 않습니다.
 *        '404':
 *          description: 요청한 게시물이 존재하지 않는 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 존재하지 않는 게시글 입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 게시글 삭제에서 에러가 발생했습니다.
 */

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

    await prisma.$transaction(async (prisma) => {

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

      await prisma.locations.update({
        where: { locationId: post.LocationId },
        data: {
          postCount: {
            decrement: 1,
          },
        },
      });

      // 게시글 삭제할 때 마지막 게시글이 삭제가 되면 로케이션 정보도 삭제가 되어야한다.
      const findLocation = await prisma.locations.findFirst({
        where: { locationId: post.LocationId }
      })

      if (findLocation.postCount === 0) {
        await prisma.locations.delete({
          where: { locationId: post.LocationId }
        })
      }
    });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;
