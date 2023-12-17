import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jimp from "jimp";
import { profileEditSchema } from "../../validations/auth.validation.js";

import multer from "multer";
import crypto from "crypto";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

// To get a complately unique name
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const imageName = randomImageName(); // file name will be random

const router = express.Router();
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: bucketRegion,
});

/**
 * @swagger
 * tags:
 *   - name: Profiles
 *     description: 프로필 조회/프로필 수정/유저의 북마크 조회/유저가 작성한 게시글의 목록 조회
 */

/**
 * @swagger
 * paths:
 *  /users/self/profile:
 *    get:
 *      summary: 프로필 조회
 *      description: 로그인에 성공한 사용자는 자신의 프로필을 조회할 수 있다
 *      tags: [Users]
 *      responses:
 *        '200':
 *          description: 사용자의 정보를 성공적으로 가져왔을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  postsCount:
 *                    type: integer
 *                    description: 사용자 자신이 작성한 게시글의 갯수
 *                    example: 5
 *                  data:
 *                    type: object
 *                    properties:
 *                      email:
 *                        type: string
 *                        description: 사용자 이메일 주소
 *                      nickname:
 *                        type: string
 *                        description: 사용자 닉네님
 *                      imgUrl:
 *                        type: string
 *                        description: 사용자의 프로필 이미지 주소(이미지는 S3에 저장)
 *                      Posts:
 *                        type: array
 *                        description: 사용자의 게시글 목록
 *                        items:
 *                          type: object
 *                          properties:
 *                            postId:
 *                              type: integer
 *                              description: 각 게시글의 고유 번호
 *        '500':
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

// Profile API
router.get("/users/self/profile", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    // 유저가 작성한 게시글의 갯수
    const myPostsCount = await prisma.posts.count({
      where: {
        UserId: +userId,
      },
    });

    const userPosts = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
      select: {
        email: true,
        nickname: true,
        imgUrl: true,
        Posts: {
          select: {
            postId: true,
            UserId: true,
            imgUrl: true,
            content: true,
            likeCount: true,
            createdAt: true,
            updatedAt: true,
            Comments: {
              select: {
                UserId: true,
                PostId: true,
                content: true,
                createdAt: true,
              },
            },
            Location: {
              select: {
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
    if (userPosts.imgUrl && userPosts.imgUrl.length === 64) {
      const getObjectParams = {
        Bucket: bucketName, // 버킷 이름
        Key: userPosts.imgUrl, // 이미지 키
      };

      // User GetObjectCommand to create the url
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command);
      userPosts.imgUrl = url;
    } else {
      const defaultImageUrl =
        "https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w240-h480-rw";

      userPosts.imgUrl = defaultImageUrl;
    }

    return res.status(200).json({
      postsCount: myPostsCount,
      data: userPosts,
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /users/self/profile/bookmark:
 *    get:
 *      summary: 사용자가 북마크한 장소들의 목록들을 불러온다
 *      description: 로그인에 성공한 사용자는 자신이 북마크한 장소들의 목록들을 조회할 수 있다
 *      tags: [Users]
 *      responses:
 *        '200':
 *          description: 사용자가 북마크한 장소들의 목록을 성공적으로 불러왔을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  bookmarkCount:
 *                    type: integer
 *                    description: 사용자가 북마크한 장소들의 객수
 *                    example: 10
 *                  data:
 *                    type: array
 *                    description: 사용자가 북마크한 장소들의 목록들
 *                    items:
 *                      type: object
 *                      properties:
 *                        Location:
 *                          type: object
 *                          properties:
 *                            locationId:
 *                              type: integer
 *                              description: 북마크한 장소의 고유 번호
 *                            storeName:
 *                              type: string
 *                              description: 북마크한 장소 이름
 *                            address:
 *                              type: string
 *                              description: 북마크한 장소의 주소
 *                            starAvg:
 *                              type: number
 *                              description: 해당 장소의 별점 평균
 *                            Posts:
 *                              type: array
 *                              description: 장소에 관련관 게시글들의 목록
 *                              items:
 *                                type: object
 *                                properties:
 *                                  LocationId:
 *                                    type: integer
 *                                    description: 장소 고유의 번호
 *                                  likeCount:
 *                                    type: integer
 *                                    description: 해당하는 장소에 관련된 게시글의 좋아요 갯수
 *                                  imgUrl:
 *                                    type: string
 *                                    description: 해당하는 장소의 이미지 주소
 *        '500':
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

// 마이페이지 북마크
router.get(
  "/users/self/profile/bookmark",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;

      // 유저가 북마크한 장소들의 갯수
      const myFavouritePlacesCount = await prisma.bookmark.count({
        where: {
          UserId: +userId,
        },
      });

      const favouritePlaces = await prisma.bookmark.findMany({
        where: {
          UserId: +userId,
        },
        select: {
          Location: {
            select: {
              locationId: true,
              storeName: true,
              address: true,
              starAvg: true,
              Posts: {
                select: {
                  LocationId: true,
                  likeCount: true,
                  imgUrl: true,
                },
                orderBy: {
                  likeCount: "desc",
                },
              },
              Category: {
                select: {
                  categoryName: true,
                },
              },
              District: {
                select: {
                  districtName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res
        .status(200)
        .json({ bookmarkCount: myFavouritePlacesCount, data: favouritePlaces });
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
    }
  },
);

// 매모리 저장 객체 생성
const storage = multer.memoryStorage();
// multer로 업로드 기능을 생성. 항상 이미지를 메모리에 저장하도록 하기 위함이다.
const upload = multer({ storage: storage });

/**
 * @swagger
 * paths:
 *  /users/self/profile/edit:
 *    patch:
 *      summary: 사용자 프로필 수정
 *      description: 사용자는 자신의 프로필을 수정할 수 있다
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                nickname:
 *                  type: string
 *                  description: 새로운 닉네임
 *                newPassword:
 *                  type: string
 *                  description: 새로운 비밀번호
 *                confirmedPassword:
 *                  type: string
 *                  description: 입력된 새로운 비밀번호 재확인
 *                imgUrl:
 *                  type: string
 *                  format: binary
 *                  description: 프로필 사진 수정하기 위해서 업로드
 *      responses:
 *        '201':
 *          description: 프로필이 성공적으로 수정되었을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    message: 회원정보가 수정되었습니다.
 *        '400':
 *          description: 입력한 두 비밀번호가 일치하지 않을 경우 (new password !== repeat password)
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 비밀번호가 일치하지 않습니다. 다시 확인해주세요.
 *        '401':
 *          description: 사용자가 입력한 비밀번호가 이전의 비밀번호와 같은 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    message: 새 비밀번호를 입력해 주세요
 *        '500':
 *          description: 서버에서 에러가 발생하였을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다
 */

// 마이페이지 내 정보 수정
router.patch(
  "/users/self/profile/edit",
  upload.single("imgUrl"),
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      // 새 비밀번호, 확인용 비밀번호
      const validation = await profileEditSchema.validateAsync(req.body);
      const { nickname, newPassword, confirmedPassword } = validation;

      // console.log("req.file", req.file); // to display data about the image
      //req.file.buffer; // you want to send this data to the s3 bucket

      // ** 이미지가 수정되었는지 확인 **
      if (req.file) {
        // resize image
        // So get the file from the post request, pass that into sharp, do some things with it,
        // get a new buffer of the modified image data and send that to S3
        // const buffer = await sharp(req.file.buffer)
        //   .resize({ height: 1920, width: 1080, fit: "contain" })
        //   .toBuffer();

        const image = await jimp.read(req.file.buffer);
        const processedImage = await image
          .resize(jimp.AUTO, 150) // 이미지 크기 조절
          .quality(70) // 이미지 품질 설정
          .getBufferAsync(jimp.AUTO); // 버퍼로 변환

        // S3에 보낼 버퍼 처리
        const params = {
          Bucket: bucketName,
          // Key: req.file.originalname, // image files with the same name will overlap
          Key: imageName,
          // Body: req.file.buffer,
          Body: processedImage,
          ContentType: req.file.mimetype,
        };

        // Specify all the information about the file here
        const command = new PutObjectCommand(params);
        // send the command to the S3 bucket
        await s3.send(command);

        await prisma.users.update({
          where: {
            userId: +userId,
          },
          data: {
            imgUrl: imageName,
          },
        });
      }

      // 새 비밀번호만 입력하고 확인용 비밀번호를 입력하지 않은 경우
      if (newPassword !== undefined && confirmedPassword === undefined) {
        return res.status(400).json({
          errorMessage: "새 비밀번호를 입력해 주세요",
        });
      }

      // 새 비밀번호를 입력하지 않고 확인용 비밀번호만 입력한 경우
      if (newPassword === undefined && confirmedPassword !== undefined) {
        return res.status(400).json({
          errorMessage: "새 비밀번호를 입력해 주세요",
        });
      }

      // ** 비밀번호가 변경되었는지 확인 **
      if (newPassword !== undefined && confirmedPassword !== undefined) {
        const user = await prisma.users.findFirst({
          where: {
            userId: +userId,
          },
        });

        if (newPassword !== confirmedPassword) {
          return res.status(400).json({
            errorMessage: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
          });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 이전의 비밀번호와 같은 비밀번호를 입력했을 때
        // 이전의 비밀번호와 새로운 비밀번호가 같은지를 확인하기 위해 해시된 값이 아닌,
        // 해시화되지 않은 원본 비밀번호를 비교해야 한다.
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
          return res
            .status(401)
            .json({ errorMessage: "이미 이전의 비밀번호와 일치합니다." });
        }

        await prisma.users.update({
          where: {
            userId: +userId,
          },
          data: {
            password: hashedPassword,
          },
        });
      }

      // ** 닉네임이 변경되었는지 확인 **
      if (nickname !== undefined) {
        await prisma.users.update({
          where: {
            userId: +userId,
          },
          data: {
            nickname: nickname,
          },
        });
      }

      return res.status(201).json({ message: "회원정보가 수정되었습니다." });
    } catch (error) {
      console.error(error);

      if (error.name === "ValidationError") {
        return res.status(400).json({ errorMessage: error.message });
      }

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
    }
  },
);

export default router;
