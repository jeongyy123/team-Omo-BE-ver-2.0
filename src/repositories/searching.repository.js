import { prisma } from "../utils/prisma/index.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSingleImageS3 } from '../utils/getImageS3.js'
import dotenv from "dotenv";

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

export class SearchingRepository {
  // getSearchingByNickname = async (users) => {
  //   const usersPosts = await Promise.all(users.map(async (user) => {
  //     const posts = await prisma.posts.findMany({
  //       where: { UserId: user.userId },
  //       select: {
  //         User: {
  //           select: {
  //             nickname: true,
  //           },
  //         },
  //         Category: {
  //           select: {
  //             categoryName: true,
  //           },
  //         },
  //         Location: {
  //           select: {
  //             locationId: true,
  //             storeName: true,
  //             address: true,
  //             starAvg: true,
  //             postCount: true,
  //           },
  //         },
  //         postId: true,
  //         imgUrl: true,
  //         content: true,
  //         likeCount: true,
  //         commentCount: true,
  //         createdAt: true,
  //       },
  //       orderBy: { postId: "desc" }
  //     });

  //     const imgUrlsArray = posts.map((post) =>
  //       post.imgUrl.split(",").map((url) => ({
  //         Bucket: bucketName,
  //         Key: url,
  //       }))
  //     );

  //     const signedUrlsArray = await Promise.all(
  //       imgUrlsArray.map(async (params) => {
  //         const commands = params.map((param) =>
  //           new GetObjectCommand(param)
  //         );
  //         const urls = await Promise.all(
  //           commands.map((command) => getSignedUrl(s3, command))
  //         );
  //         return urls;
  //       })
  //     );

  //     return posts.map((post, i) => {
  //       post.imgUrl = signedUrlsArray[i];
  //       return post;
  //     });
  //   })
  //   );
  //   return usersPosts.flat();
  // }

  getSearchingByStoreName = async (storeName) => {
    const findStores = await prisma.posts.findMany({
      where: {
        Location: {
          storeName: {
            contains: storeName
          }
        }
      },
      select: {
        postId: true,
        likeCount: true,
        commentCount: true,
        star: true,
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
            userId: true,
            nickname: true,
          },
        },
      }
    })
    return findStores;
    // const imgUrlsArray = stores.map((store) =>
    //   store.imgUrl.split(",").map((url) => ({
    //     Bucket: bucketName,
    //     Key: url,
    //   }))
    // );

    // const signedUrlsArray = await Promise.all(
    //   imgUrlsArray.map(async (params) => {
    //     const commands = params.map((param) =>
    //       new GetObjectCommand(param)
    //     );
    //     const urls = await Promise.all(
    //       commands.map((command) => getSignedUrl(s3, command))
    //     );
    //     return urls;
    //   })
    // );

    // stores.map((store, i) => {
    //   store.imgUrl = signedUrlsArray[i];
    //   return store;
    // });
    // return stores;
  }

  getSearchingByNickname = async (nickname) => {
    const findUsers = await prisma.users.findMany({
      where: {
        nickname: {
          contains: nickname,
        }
      },
      select: {
        userId: true,
        nickname: true,
        imgUrl: true,
      }
    })

    const imgUrlPromises = findUsers.map(async (user) => {
      const params = {
        Bucket: bucketName,
        Key: user.imgUrl,
      };

      console.log("params >>>>>>>>> ", params);

      const command = new GetObjectCommand(params);
      const imgUrl = await getSignedUrl(s3, command);
      return imgUrl;
    });

    const imgUrls = await Promise.all(imgUrlPromises);

    findUsers.forEach((user, index) => {
      user.imgUrl = imgUrls[index];
    });

    return findUsers;
  }
}