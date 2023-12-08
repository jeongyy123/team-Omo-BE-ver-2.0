import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sharp from "sharp"; // To adjust image size

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

// My page
router.get("/users/self/profile", authMiddleware, async (req, res, next) => {
  try {
    const { userId, imgUrl, nickname, email } = req.user;

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
                updatedAt: true,
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
        updatedAt: "desc", 
      },
    });

    const getObjectParams = {
      Bucket: bucketName,
      Key: userPosts.imgUrl, // 단일 사용자의 이미지 이름 사용
    };

    // User GetObjectCommand to create the url
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command);
    userPosts.imgUrl = url;

    console.log("userPosts >>>>>>>>>>>>>>>>>>>>>>", userPosts);
    // 하기 => 각 포스트의 댓글 갯수 계산하기

    return res.status(200).json({ postsCount: myPostsCount, data: userPosts });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
  }
});

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
          UserId: true,
          LocationId: true,
          Location: {
            select: {
              locationId: true,
              storeName: true,
              address: true,
              starAvg: true, //??
              Posts: {
                select: {
                  LocationId: true,
                  imgUrl: true, // ***********
                },
                orderBy: {
                  likeCount: "desc", // **************
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

      // 장소와 관련된 게시글 갯수
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

// 마이페이지 내 정보 수정
router.patch(
  "/users/self/profile/edit",
  upload.single("imgUrl"),
  authMiddleware,
  async (req, res, next) => {
    try {
      console.log("req.body", req.body);
      console.log("req.file", req.file); // to display data about the image

      //req.file.buffer; // you want to send this data to the s3 bucket

      // resize image
      // So get the file from the post request, pass that into sharp, do some things with it,
      // get a new buffer of the modified image data and send that to S3
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 1920, width: 1080, fit: "contain" })
        .toBuffer();

      const params = {
        Bucket: bucketName,
        // Key: req.file.originalname, // image files with the same name will overlap
        Key: imageName,
        // Body: req.file.buffer,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      // Specify all the information about the file here
      const command = new PutObjectCommand(params);
      // send the command to the S3 bucket
      await s3.send(command);

      const { nickname } = req.body;
      const { userId } = req.user;

      //const hashedPassword = await bcrypt.hash(password, 10);

      const newUserInfo = await prisma.users.update({
        where: {
          userId: +userId,
        },
        data: {
          imgUrl: imageName,
          nickname: nickname,
          //password: hashedPassword,
        },
      });

      console.log("New User Info >>>", newUserInfo);

      return res.status(201).json({ message: "회원정보가 수정되었습니다." });
    } catch (error) {
      console.error(error);
    }
  },
);

export default router;

// References
// https://www.npmjs.com/package/multer
// https://www.youtube.com/watch?v=eQAIojcArRY
// https://www.npmjs.com/package//sharp
// https://www.npmjs.com/package/@aws-sdk/s3-request-presigner
