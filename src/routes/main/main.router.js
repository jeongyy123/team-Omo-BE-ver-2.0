import express from "express";
import multer from "multer";
import { prisma } from "../../utils/prisma/index.js";

import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
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

// 주소 -> 자치구에 해당하는 주소 조회 함수
function checkAddress(address) {
  const districtName = address.split(" ")[1];

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

/* 인기글 조회 */
// 자치구별 / 좋아요 20개이상 / 작성일 기준 최신순
router.get("/main/popular", async (req, res, next) => {
  try {
    const { address, limit } = req.query;

    const findLocations = await checkAddress(address);

    const findPosts = await prisma.posts.findMany({
      where: {
        LocationId: findLocations.LocationId,
        likeCount: {
          gte: 20,
        },
      },
      select: {
        imgUrl: true,
        content: true,
        commentCount: true,
        Location: {
          select: {
            storeName: true,
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
            getSignedUrl(s3, command, { expiresIn: 3600 }),
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
  }
});

/* 최신글 조회 */
// 자치구별 최신순 게시물
router.get("/main/recent", async (req, res, next) => {
  try {
    const { address, limit } = req.query;

    const districtName = address.split(" ")[1];

    const findLocations = await checkAddress(address);

    const parsedLimit = +limit || 9;

    if (!parsedLimit || parsedLimit <= 0) {
      return res.status(400).json({ message: "limit값을 입력해주세요" });
    }

    const findPosts = await prisma.posts.findMany({
      where: {
        LocationId: findLocations.locationId,
        Location: {
          District: {
            districtName
          }
        }
      },
      select: {
        imgUrl: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        User: {
          select: {
            nickname: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: +limit
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
  }
});

/* 댓글 조회 */
router.get("/main/comments", async (req, res, next) => {
  try {
    const { address, limit } = req.query;

    const findLocations = await checkAddress(address);

    const findPosts = await prisma.posts.findFirst({
      where: { LocationId: findLocations.locationId },
    });

    const findComments = await prisma.comments.findMany({
      where: { PostsId: findPosts.postsId },
      select: {
        content: true,
        createdAt: true,
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
