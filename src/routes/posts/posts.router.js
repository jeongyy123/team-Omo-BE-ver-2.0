import express from "express";
import multer from "multer";
import jimp from "jimp";
import { prisma } from "../../utils/prisma/index.js";
import {
  createPostsSchema,
  editPostsSchema,
} from "../../validations/posts.validation.js";
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
    // await redis.set(page, JSON.stringify(posts));

    return res.status(200).json(posts);
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
        // Comments: {
        //   select: {
        //     commentId: true,
        //     content: true,
        //     createdAt: true,
        //     User: {
        //       select: {
        //         userId: true,
        //         imgUrl: true,
        //         nickname: true,
        //       },
        //     },
        //     Replies: {
        //       select: {
        //         replyId: true,
        //         content: true,
        //         createdAt: true,
        //         User: {
        //           select: {
        //             userId: true,
        //             imgUrl: true,
        //             nickname: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
      },
    });

    if (!posts) {
      return res.status(404).json({ message: "존재하지않는 게시글입니다." });
    }

    // await getRepliesImageS3(posts.Comments);
    // await getProfileImageS3(posts.Comments);
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
      const validation = await createPostsSchema.validateAsync(req.body);
      const {
        content,
        categoryName,
        storeName,
        address,
        latitude,
        longitude,
        star,
        placeInfoId,
      } = validation;
      const { userId } = req.user;

      const category = await prisma.categories.findFirst({
        where: { categoryName },
      });

      const district = await prisma.districts.findFirst({
        where: { districtName: address.split(" ")[1] },
      });

      if (!district) {
        return res.status(400).json({ message: "지역이 존재하지 않습니다." });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "사진을 등록해주세요." });
      }

      //이미지 이름 나눠서 저장
      const imgPromises = req.files.map(async (file) => {
        if (file.size > 6000000) {
          // 1500000
          return res
            .status(400)
            .json({ message: "3MB이하의 이미지파일만 넣어주세요." });
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

// 게시물 수정
router.patch("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    const validation = await editPostsSchema.validateAsync(req.body);
    const {
      address,
      content,
      star,
      storeName,
      placeInfoId,
      latitude,
      longitude,
      categoryName,
    } = validation;
    // 확인사항: 주소를 바꾸는 경우에는 latitude, longitude, categoryName, placeInfoId도 받아서 같이 수정해야함
    // 수정사항 : 기존에 location이 있어도 장소가 변경되는 경우 기존 장소를 수정해버림..
    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    if (!post) {
      res.status(404).json({ message: "존재하지 않는 게시글 입니다." });
    }

    if (post.UserId !== userId) {
      return res
        .status(401)
        .json({ message: "삭제할 권한이 존재하지 않습니다." });
    }

    // 수정 후 category 정보
    const category = await prisma.categories.findFirst({
      where: { categoryName },
    });

    // 수정 후 district 정보
    const district = await prisma.districts.findFirst({
      where: { districtName: address.split(" ")[1] },
    });

    if (!district) {
      return res.status(400).json({ message: "지역이 존재하지 않습니다." });
    }

    // 수정 후 location 정보
    const afterEditPostLocation = await prisma.locations.findFirst({
      where: { address },
    });

    // 수정 후 location 정보가 있을 경우
    // -> post 수정( content, star ) & location 수정 ( starAvg, postCount )
    if (afterEditPostLocation) {
      await prisma.$transaction(async (prisma) => {
        const createPost = await prisma.posts.update({
          where: { postId: +postId, UserId: +userId },
          data: {
            LocationId: afterEditPostLocation.locationId,
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

        // 수정 후 location
        await prisma.locations.update({
          where: {
            locationId: afterEditPostLocation.locationId,
          },
          data: {
            starAvg: starAvg._avg.star,
            postCount: {
              increment: 1,
            },
          },
        });

        // 수정 전 post의 location.postCount decrement
        const beforeEditPostLocation = await prisma.locations.update({
          where: { locationId: post.LocationId },
          data: {
            postCount: {
              decrement: 1,
            },
          },
        });

        // 만약 수정 후에 기존 location.postcount가 0이 된다면 삭제
        if (beforeEditPostLocation.postCount === 0) {
          await prisma.locations.delete({
            where: { locationId: beforeEditPostLocation.locationId },
          });
        }
      });
    } else {
      // 수정 후 location 정보가 없는경우
      // -> post정보 수정 & 수정 후 location 정보 생성
      // -> 수정 전 location 정보 수정
      await prisma.$transaction(async (prisma) => {
        // 수정 후의 location 정보 create
        const location = await prisma.locations.create({
          data: {
            starAvg: 0,
            address,
            storeName,
            placeInfoId,
            latitude,
            longitude,
            postCount: 1,
            Category: { connect: { categoryId: +category.categoryId } },
            District: { connect: { districtId: +district.districtId } },
            User: { connect: { userId: +userId } },
          },
        });

        const createPost = await prisma.posts.update({
          where: { postId: +postId, UserId: +userId },
          data: {
            LocationId: location.locationId,
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

        //starAvg 갱신
        await prisma.locations.update({
          where: { locationId: location.locationId },
          data: {
            starAvg: starAvg._avg.star,
          },
        });

        // 수정 전 post의 location decrement 하기
        const beforeEditPostLocation = await prisma.locations.update({
          where: { locationId: post.LocationId },
          data: {
            postCount: {
              decrement: 1,
            },
          },
        });

        // 수정 전 location.postcount가 0이 되면 지워
        if (beforeEditPostLocation.postCount === 0) {
          await prisma.locations.delete({
            where: { locationId: beforeEditPostLocation.locationId },
          });
        }
      });
    }
    return res.status(201).json({ message: "게시물을 수정하였습니다." });
  } catch (error) {
    next(error);
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
        .status(401)
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
        where: { locationId: post.LocationId },
      });

      if (findLocation.postCount === 0) {
        await prisma.locations.delete({
          where: { locationId: post.LocationId },
        });
      }
    });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    next(error);
  }
});

export default router;
