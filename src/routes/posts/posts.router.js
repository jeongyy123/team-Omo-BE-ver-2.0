import express from "express";
import multer from "multer";
import jimp from "jimp";
import { prisma } from "../../utils/prisma/index.js";
import { createPosts } from "../../validations/posts.validation.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { getImageS3, getManyImagesS3, getSingleImageS3, getProfileImageS3 } from "../../utils/getImageS3.js";
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
const upload = multer({ storage: storage });

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

// const redisClient = new Redis({
//   host: process.env.REDIS_HOST, // Redis 서버 호스트
//   port: process.env.REDIS_PORT,         // Redis 포트 번호
//   password: process.env.REDIS_PASSWORD,         // Redis 포트 번호
// });

/* 게시물 목록 조회 */
// 자치구 카테고리 선택 시 -> 조회 (없으면 전 자치구 조회)
// (음식점, 카페, 기타) 카테고리 선택시 -> 조회 (없으면 해당 카테고리의 전체 조회)
// lastSeenPage : 조회 전 마지막 게시글 postId
// page : 몇 개의 게시글 조회할 지
// 1. lastSeenPage X (첫페이지 조회) : 요청 page만큼 넘기기
// 2. lastSeenPage O (두번째 이후 조회) : lastSeenPage보다 작은 postId 조회, 요청 page만큼 넘기기
router.get("/posts", async (req, res, next) => {
  try {
    const { page, lastSeenPage, categoryName, districtName } = req.query;

    const findCategory = categoryName
      ? await prisma.categories.findFirst({ where: { categoryName } })
      : null;
    const findDistrict = districtName
      ? await prisma.districts.findFirst({ where: { districtName } })
      : null;

    const parsedPage = parseInt(page) || 24; // 조회할 게시글 수

    let posts;
    if (!lastSeenPage) {
      posts = await prisma.posts.findMany({
        select: {
          User: {
            select: {
              nickname: true,
            },
          },
          Location: {
            select: {
              storeName: true,
              address: true,
              starAvg: true,
              postCount: true
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
        where: {
          ...(findCategory?.categoryId && {
            CategoryId: findCategory.categoryId,
          }),
          ...(findDistrict?.districtId && {
            Location: { DistrictId: findDistrict.districtId },
          }),
          updatedAt: {
            lt: new Date(), // 조회 당시 시간으로 또다른 사용자가 작성한 글 보지 않도록 하기.
          },
        },
      });
    } else {
      posts = await prisma.posts.findMany({
        select: {
          User: {
            select: {
              nickname: true,
            },
          },
          Location: {
            select: {
              storeName: true,
              address: true,
              starAvg: true,
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
          postId: {
            lt: parseInt(lastSeenPage),
          },
        },
      });
    }

    if (!posts) {
      return res.status(400).json({ message: "존재하지 않는 게시글입니다." });
    }

    await getManyImagesS3(posts);

    return res.status(200).json({ posts });
  } catch (error) {
    next(error);
  }
});

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
            nickname: true,
            imgUrl: true
          },
        },
        Location: {
          select: {
            address: true,
            storeName: true,
            latitude: true,
            longitude: true,
            Category: {
              select: {
                categoryId: true,
                categoryName: true
              }
            }
          },
        },
        Comments: {
          select: {
            commentId: true,
            content: true,
            createdAt: true,
            User: {
              select: {
                imgUrl: true,
                nickname: true
              }
            }
          },
        },
      },
    });

    if (!posts) {
      return res.status(400).json({ message: "존재하지않는 게시글입니다." });
    }

    const getProfileImageS31 = async (posts) => {
      posts.map(async (post) => {
        const params = {
          Bucket: bucketName,
          Key: post.User.imgUrl
        }
        const command = new GetObjectCommand(params);
        const imgUrl = await getSignedUrl(s3, command);
        console.log("imgUrl", imgUrl)
        return post.User.imgUrl = imgUrl
      })
    }

    await getProfileImageS3(posts.Comments);
    await getSingleImageS3(posts.User);
    await getImageS3(posts);

    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
});

/* 게시물 작성 */
router.post(
  "/posts",
  authMiddleware,
  upload.array("imgUrl", 5),
  async (req, res, next) => {
    try {
      const validation = await createPosts.validateAsync(req.body);
      const {
        content,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
      } = validation;
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
        return res
          .status(400)
          .json({ message: "카테고리가 존재하지 않습니다." });
      }

      const districtName = address.split(" ")[1];

      const district = await prisma.districts.findFirst({
        where: { districtName },
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
              address,
            },
          },
        },
      });

      if (findPosts) {
        return res.status(400).json({
          message: "이미 같은 장소에 대한 유저의 포스팅이 존재합니다.",
        });
      }

      //이미지 이름 나눠서 저장
      const imgPromises = req.files.map(async (file) => {
        const imgName = randomImgName();

        // 이미지 사이즈 조정
        const buffer = await jimp.read(file.buffer)
          .then(image => image.resize(jimp.AUTO, 350).quality(70).getBufferAsync(jimp.MIME_JPEG));

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
        const createLocation = await prisma.locations.create({
          data: {
            storeName,
            address,
            latitude,
            longitude,
            starAvg: 0,
            Category: { connect: { categoryId: +category.categoryId } },
            District: { connect: { districtId: +district.districtId } },
            User: { connect: { userId: +user.userId } },
          },
        });

        await prisma.posts.create({
          data: {
            content,
            star,
            likeCount: 0,
            User: { connect: { userId: +user.userId } },
            Category: { connect: { categoryId: +category.categoryId } },
            Location: { connect: { locationId: +createLocation.locationId } },
            imgUrl: imgNames.join(","),
          },
        });
      } else {
        //location 정보가 기존 O => location 업데이트, posts 생성
        await prisma.$transaction(async (prisma) => {
          await prisma.posts.create({
            data: {
              content,
              star,
              likeCount: 0,
              User: { connect: { userId: +user.userId } },
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
            },
          });
        });
      }

      return res.status(200).json({ message: "게시글 등록이 완료되었습니다." });
    } catch (error) {
      next(error);
      throw new Error("게시글 작성에 실패했습니다.");
    }
  },
);

// 게시물 수정
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const { address, content, star, storeName } = req.body;

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    if (!post) {
      res.status(404).json({ message: "존재하지 않는 게시글 입니다." });
    }
    await prisma.$transaction(async (prisma) => {
      const createPost = await prisma.posts.update({
        where: { postId: +postId, UserId: +userId },
        data: {
          content,
          star
        },
      });

      //starAvg 업데이트
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
          starAvg: starAvg._avg.star, address, storeName
        },
      });
    })

    return res.status(200).json({ message: "게시물을 수정하였습니다." });
  } catch (error) {
    next(error);
    throw new Error("게시글 수정에서 에러가 발생했습니다.")
  }
});

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
    });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;