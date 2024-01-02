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
    const validation = await searchingSchema.validateAsync(req.query);
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
      //userId를 찾고, 해당 post를 찾기
      const users = await prisma.users.findMany({
        where: {
          nickname: {
            contains: nickname,
          }
        },
        select: {
          userId: true,
        }
      });

      if (!users || users.length === 0) {
        return res
          .status(400)
          .json({ message: "검색하신 유저의 정보가 없어요." });
      }

      const usersPosts = await Promise.all(users.map(async (user) => {
        const posts = await prisma.posts.findMany({
          where: { UserId: user.userId },
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
          orderBy: { postId: "desc" }
        });

        const imgUrlsArray = posts.map((post) =>
          post.imgUrl.split(",").map((url) => ({
            Bucket: bucketName,
            Key: url,
          }))
        );

        const signedUrlsArray = await Promise.all(
          imgUrlsArray.map(async (params) => {
            const commands = params.map((param) =>
              new GetObjectCommand(param)
            );
            const urls = await Promise.all(
              commands.map((command) => getSignedUrl(s3, command))
            );
            return urls;
          })
        );

        return posts.map((post, i) => {
          post.imgUrl = signedUrlsArray[i];
          return post;
        });
      })
      );
      resultData = usersPosts.flat();

      if (!resultData || resultData.length === 0) {
        return res.status(404).json({ message: "해당 유저가 작성한 게시글이 없어요." })
      }
    }

    if (storeName) {
      const stores = await prisma.posts.findMany({
        where: {
          Location: {
            storeName: {
              contains: storeName
            }
          }
        },
        select: {
          imgUrl: true,
          content: true,
          likeCount: true,
          commentCount: true,
          createdAt: true,
          content: true,
          Location: {
            select: {
              locationId: true,
              storeName: true,
              address: true,
              starAvg: true,
              latitude: true,
              longitude: true,
              starAvg: true,
              postCount: true,
              placeInfoId: true,
            }
          },
          Category: {
            select: {
              categoryName: true
            }
          },
          User: {
            select: {
              nickname: true,
            },
          },
        }
      })

      if (!stores || stores.length === 0) {
        return res
          .status(400)
          .json({ message: "검색하신 가게 정보가 없어요." });
      }

      const imgUrlsArray = stores.map((store) =>
        store.imgUrl.split(",").map((url) => ({
          Bucket: bucketName,
          Key: url,
        }))
      );

      const signedUrlsArray = await Promise.all(
        imgUrlsArray.map(async (params) => {
          const commands = params.map((param) =>
            new GetObjectCommand(param)
          );
          const urls = await Promise.all(
            commands.map((command) => getSignedUrl(s3, command))
          );
          return urls;
        })
      );

      resultData = stores.map((store, i) => {
        store.imgUrl = signedUrlsArray[i];
        return store;
      });
    }

    return res.status(200).json(resultData);
  } catch (error) {
    next(error);
  }
});

export default router;
