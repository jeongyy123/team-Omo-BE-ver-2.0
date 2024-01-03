import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { prisma } from "../../utils/prisma/index.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jimp from "jimp";
import { profileEditSchema } from "../../validations/auth.validation.js";
import multer from "multer";
import crypto from "crypto";
import { fileFilter } from "../../utils/putImageS3.js";
import { ProfileController } from "../../controllers/profile.controller.js";

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
const profileController = new ProfileController(); // ProfileController를 인스턴스화 시킨다.

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// s3의 서비스 객체
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: bucketRegion,
});

// 마이페이지 회원정보 확인 API
// router.get("/users/self/profile", authMiddleware, async (req, res, next) => {
//   try {
//     const { userId } = req.user;

//     const userInfo = await prisma.users.findFirst({
//       where: {
//         userId: +userId,
//       },
//       select: {
//         email: true,
//         nickname: true,
//         imgUrl: true,
//       },
//     });

//     // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
//     if (userInfo.imgUrl && userInfo.imgUrl.length === 64) {
//       const getObjectParams = {
//         Bucket: bucketName, // 버킷 이름
//         Key: userInfo.imgUrl, // 이미지 키
//       };

//       // User GetObjectCommand to create the url
//       const command = new GetObjectCommand(getObjectParams);
//       const url = await getSignedUrl(s3, command);
//       userInfo.imgUrl = url;
//     } else {
//       const defaultImageUrl =
//         "https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w240-h480-rw";

//       userInfo.imgUrl = defaultImageUrl;
//     }

//     return res.status(200).json({ data: userInfo });
//   } catch (error) {
//     console.error(error);

//     return res
//       .status(500)
//       .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
//   }
// });

// 마이페이지 게시글 조회 API
router.get(
  "/users/self/profile/posts",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      const pageSize = req.query.pageSize || 10; // 한 페이지에 표시할 데이터의 갯수

      // https://tonadus.shop/api/users/self/profile/posts?lastPostId=5&pageSize=10

      console.log("pageSize >>>", pageSize);

      // 유저가 작성한 게시글의 갯수
      const myPostsCount = await prisma.posts.count({
        where: {
          UserId: +userId,
        },
      });

      // 이전 페이지의 마지막 postId를 쿼리스트링을 통해 받아옴
      const lastPostId = req.query.lastPostId || null;

      const userPosts = await prisma.posts.findMany({
        where: {
          UserId: +userId,
          // 이전 페이지의 마지막 lastPostId보다 큰 값일 경우에만 추가 필터링
          postId: lastPostId ? { gt: +lastPostId } : undefined,
        },
        // 내 게시글
        select: {
          postId: true,
          UserId: true,
          User: {
            select: {
              nickname: true, // 현재 유저 네임!
            },
          },
          imgUrl: true,
          content: true,
          likeCount: true,
          commentCount: true, // 각 게시글의 댓글 갯수
          createdAt: true,
          updatedAt: true,
          Comments: {
            // 게시글에 있는 댓글
            select: {
              UserId: true,
              PostId: true,
              content: true,
              createdAt: true,
              User: {
                select: {
                  nickname: true, // 댓글 작성자의 닉네임
                  imgUrl: true, // 댓글 작성자의 프로필 사진
                },
              },
            },
          },
          Location: {
            select: {
              address: true,
            },
          },
        },
        take: +pageSize, // 가져올 데이터의 갯수
        orderBy: {
          postId: "desc", // 커서 기반 정렬
        },
      });

      //-------------------------------------------------------
      for (let i = 0; i < userPosts.length; i++) {
        const imgUrls = userPosts[i].imgUrl.split(","); // image urls for each post
        console.log("imgUrls >>>", imgUrls);

        const imgUrl = []; // one to many

        // 각 게시글에 있는 이미지들
        for (let j = 0; j < imgUrls.length; j++) {
          const currentImgUrl = imgUrls[j];
          console.log("currentImgUrl >>>>", currentImgUrl);

          // 지금 db에 저장된 이미지 주소는 64자의 해시화된 값이기 때문이다
          if (currentImgUrl.length === 64) {
            // S3에서 객체를 가져오기 위해 사용될 매개변수들
            // S3의 getObject 함수를 호출하여 해당 객체를 가져온다
            const getObjectParams = {
              Bucket: bucketName, // 객체들을 보관하는 s3의 저장공간
              Key: currentImgUrl, // 가져오려는 객체의 키 => 이를 사용하여 객체를 식별
            };

            try {
              // getObjectCommand는 AWS SDK에서 "가져오기 작업"을 수행하기 위한 명령(Command) 객체를 생성
              // getSignedUrl 함수를 호출하여 해당 객체에 대한 서명된 URL을 얻기 위해 AWS SDK에 요청
              const command = new GetObjectCommand(getObjectParams);
              // getSignedUrl 함수는 AWS SDK에서 제공하는 함수 중 하나로, 서명된 URL을 얻기 위해 사용
              // s3 - s3의 서비스 객체
              // command - : 서명된 URL을 얻기 위해 실행할 명령(Command) 객체가 전달
              // 이 작업은 비 동기적으로 이루어지므로 await를 사용하여 URL을 기다린 후에 url 변수에 저장
              const url = await getSignedUrl(s3, command);
              imgUrl.push(url); // 서명된 URL을 배열에 추가
            } catch (error) {
              console.error(
                `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
                error,
              );
            }
          } else {
            imgUrl.push(currentImgUrl); // 서명되지 않은 URL은 그대로 유지
          }
        }

        // 각 포스트에 있는 imgUrl에 이미지 1개 또는 여러개를 담은 배열을 전달
        userPosts[i].imgUrl = imgUrl;
      }
      //-------------------------------------------------------

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
  },
);

// 마이페이지 북마크
router.get(
  "/users/self/profile/bookmark",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;
      // const page = req.query.page || 1; // 페이지 번호, 쿼리 스트링을 통해서 전달
      const pageSize = req.query.pageSize || 10; // 한 페이지에 표시할 데이터의 갯수

      // https://tonadus.shop/api/users/self/profile/bookmark?lastBookmarkId=5&pageSize=20

      console.log("pageSize >>>", pageSize);

      // 유저가 북마크한 장소들의 갯수
      const myFavouritePlacesCount = await prisma.bookmark.count({
        where: {
          UserId: +userId,
        },
      });

      // 이전 페이지의 마지막 bookmarkId를 쿼리스트링을 통해 받아옴
      const lastBookmarkId = req.query.lastBookmarkId || null;

      console.log("lastBookmarkId >>>", lastBookmarkId);

      const favouritePlaces = await prisma.bookmark.findMany({
        where: {
          UserId: +userId,
          // 이전 페이지의 마지막 bookmarkId보다 큰 값일 경우에만 추가 필터링
          bookmarkId: lastBookmarkId ? { gt: +lastBookmarkId } : undefined,
        },
        select: {
          bookmarkId: true,
          // createdAt: true,
          Location: {
            select: {
              locationId: true,
              storeName: true,
              address: true,
              starAvg: true,
              postCount: true,
              placeInfoId: true,
              latitude: true,
              longitude: true,
              Posts: {
                select: {
                  LocationId: true,
                  // likeCount: true,
                  imgUrl: true,
                },
                orderBy: {
                  createdAt: "asc", // 이 장소에 대한 게시글을 맨 처음 올린사람의 이미지를 가져옴
                },
                take: 1, // 첫번째 게시글 1개만 가져오기, 여러개불러오면 낭비가 될수있음
              },
              Category: {
                select: {
                  categoryName: true,
                },
              },
            },
          }, // Location
        },
        take: +pageSize, // 가져올 데이터의 갯수
        orderBy: {
          createdAt: "desc",
        },
      });

      //-----------------------------------------------------
      // const getObjectParams = {
      //   Bucket: bucketName, // 버킷 이름
      //   Key: myPostsCount.imgUrl, // 이미지 키
      // };

      // // User GetObjectCommand to create the url
      // const command = new GetObjectCommand(getObjectParams);
      // const url = await getSignedUrl(s3, command);
      // userInfo.imgUrl = url;
      // ------------------------------------------------------
      for (let i = 0; i < favouritePlaces.length; i++) {
        // 각 장소와 관련된 첫번째 게시글의 이미지 가져오기
        const firstPostImagesPerLocation =
          favouritePlaces[i].Location.Posts[0].imgUrl.split(","); // 여러개의 이미지가 있을 수 있다.

        console.log(
          "firstPostImagesPerLocation  >>>>>>>>>>>>",
          firstPostImagesPerLocation,
        );
        // "49f6c9b7688c558931fb9140cdc84e0210295e5a37845e855f3c21206e44112f",
        // "c53de4d7c2dba1ba7c822597141a8c7056f085567bd52b54a6e1b875778c2c4f";

        const imgUrl = [];

        // for (let j = 0; j < firstPostImagesPerLocation.length; j++) {
        // 비동기 작업을 순차적으로 실행하기 위해 for...of 루프와 await를 사용합니다
        for (const currentImgUrl of firstPostImagesPerLocation) {
          // const currentImgUrl = firstPostImagesPerLocation[j];

          // 지금 db에 저장된 이미지 주소는 64자의 해시화된 값이기 때문이다
          if (currentImgUrl.length === 64) {
            // S3에서 객체를 가져오기 위해 사용될 매개변수들
            // S3의 getObject 함수를 호출하여 해당 객체를 가져온다
            const getObjectParams = {
              Bucket: bucketName, // 객체들을 보관하는 s3의 저장공간
              Key: currentImgUrl, // 가져오려는 객체의 키 => 이를 사용하여 객체를 식별
            };

            try {
              // User GetObjectCommand to create the url
              const command = new GetObjectCommand(getObjectParams);
              const url = await getSignedUrl(s3, command);
              imgUrl.push(url);
            } catch (error) {
              console.error(
                `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
                error,
              );
              // 이미지를 가져오는 데 문제가 있으면 빈 문자열 또는 다른 값을 넣는다
              imgUrl.push(""); // 빈 문자열로 대체하거나 에러 핸들링에 따라 다른 값 설정
            }
          } else {
            imgUrl.push(currentImgUrl); // 서명되지 않은 URL은 그대로 유지
          }
        }
        // 각 포스트에 있는 imgUrl에 이미지 1개 또는 여러개를 담은 배열을 전달
        // // 비동기 처리된 imgUrl을 할당
        favouritePlaces[i].Location.Posts[0].imgUrl = imgUrl;
      }

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
const upload = multer({ storage: storage, fileFilter });

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

      const imageName = randomImageName(); // file name will be random

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

// 다른 사람의 프로필 조회
router.get(
  "/users/profile/:nickname",
  authMiddleware,
  async (req, res, next) => {
    try {
      const nickname = req.params.nickname;

      const otherUserInfo = await prisma.users.findFirst({
        where: {
          nickname: nickname,
        },
        select: {
          userId: true,
          email: true,
          nickname: true,
          imgUrl: true,
        },
      });

      console.log("otherUserInfo >>>>>>>>>>>>>>", otherUserInfo);

      if (!otherUserInfo) {
        return res
          .status(404)
          .json({ errorMessage: "해당 사용자를 찾을 수 없습니다." });
      }

      // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
      if (otherUserInfo.imgUrl && otherUserInfo.imgUrl.length === 64) {
        const getObjectParams = {
          Bucket: bucketName, // 버킷 이름
          Key: otherUserInfo.imgUrl, // 이미지 키
        };

        try {
          // User GetObjectCommand to create the url
          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command);
          otherUserInfo.imgUrl = url;
        } catch (error) {
          console.error(error);
        }
      }

      return res.status(200).json({ data: otherUserInfo });
      //
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
    }
  },
);

// 다른 사람의 게시글 조회
router.get(
  "/users/profile/:nickname/posts",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { nickname } = req.params; // 다른 사용자의 닉네임
      const pageSize = req.query.pageSize || 10; // 한 페이지에 표시할 데이터의 갯수

      // https://tonadus.shop/api/users/profile/:nickname/posts?lastPostId=5&pageSize=10

      // 유저 닉네임으로 해당 유저의 userId 가져오기
      const findUser = await prisma.users.findFirst({
        where: {
          nickname: nickname,
        },
        select: {
          userId: true,
        },
      });

      console.log(
        "해당 닉네임을 사용하는 이용자의 userId >>>>>>>>>",
        user.userId,
      );

      if (!findUser) {
        return res
          .status(404)
          .json({ errorMessage: "해당 사용자를 찾을 수 없습니다." });
      }

      // 해당 유저가 작성한 게시글의 갯수
      const userPostsCount = await prisma.posts.count({
        where: {
          UserId: user.userId,
        },
      });

      console.log(
        "해당 닉네임을 사용하는 사람이 쓴 게시글 갯수 >>>>>>>>>>",
        userPostsCount,
      );

      // 이전 페이지의 마지막 postId를 쿼리스트링을 통해 받아옴
      const lastPostId = req.query.lastPostId || null;

      const userPosts = await prisma.posts.findMany({
        where: {
          UserId: +user.userId,
          // 이전 페이지의 마지막 lastPostId보다 큰 값일 경우에만 추가 필터링
          postId: lastPostId ? { gt: +lastPostId } : undefined,
        },
        // 내 게시글
        select: {
          postId: true,
          UserId: true,
          User: {
            select: {
              nickname: true, // 현재 유저 네임!
            },
          },
          imgUrl: true,
          content: true,
          likeCount: true,
          commentCount: true, // 각 게시글의 댓글 갯수
          createdAt: true,
          updatedAt: true,
          Comments: {
            // 게시글에 있는 댓글
            select: {
              UserId: true,
              PostId: true,
              content: true,
              createdAt: true,
              User: {
                select: {
                  nickname: true, // 댓글 작성자의 닉네임
                  imgUrl: true, // 댓글 작성자의 프로필 사진
                },
              },
            },
          },
          Location: {
            select: {
              address: true,
            },
          },
        },
        take: +pageSize, // 가져올 데이터의 갯수
        orderBy: {
          postId: "desc", // 커서 기반 정렬
        },
      });

      console.log("userPosts >>>>>>>>>", userPosts);

      //-------------------------------------------------------
      for (let i = 0; i < userPosts.length; i++) {
        const imgUrls = userPosts[i].imgUrl.split(","); // image urls for each post
        console.log("imgUrls >>>", imgUrls);

        const imgUrl = []; // one to many

        // 각 게시글에 있는 이미지들
        for (let j = 0; j < imgUrls.length; j++) {
          const currentImgUrl = imgUrls[j];
          console.log("currentImgUrl >>>>", currentImgUrl);

          // 지금 db에 저장된 이미지 주소는 64자의 해시화된 값이기 때문이다
          if (currentImgUrl.length === 64) {
            // S3에서 객체를 가져오기 위해 사용될 매개변수들
            // S3의 getObject 함수를 호출하여 해당 객체를 가져온다
            const getObjectParams = {
              Bucket: bucketName, // 객체들을 보관하는 s3의 저장공간
              Key: currentImgUrl, // 가져오려는 객체의 키 => 이를 사용하여 객체를 식별
            };

            try {
              // getObjectCommand는 AWS SDK에서 "가져오기 작업"을 수행하기 위한 명령(Command) 객체를 생성
              // getSignedUrl 함수를 호출하여 해당 객체에 대한 서명된 URL을 얻기 위해 AWS SDK에 요청
              const command = new GetObjectCommand(getObjectParams);
              // getSignedUrl 함수는 AWS SDK에서 제공하는 함수 중 하나로, 서명된 URL을 얻기 위해 사용
              // s3 - s3의 서비스 객체
              // command - : 서명된 URL을 얻기 위해 실행할 명령(Command) 객체가 전달
              // 이 작업은 비 동기적으로 이루어지므로 await를 사용하여 URL을 기다린 후에 url 변수에 저장
              const url = await getSignedUrl(s3, command);
              imgUrl.push(url); // 서명된 URL을 배열에 추가
            } catch (error) {
              console.error(
                `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
                error,
              );
            }
          } else {
            imgUrl.push(currentImgUrl); // 서명되지 않은 URL은 그대로 유지
          }
        }

        // 각 포스트에 있는 imgUrl에 이미지 1개 또는 여러개를 담은 배열을 전달
        userPosts[i].imgUrl = imgUrl;
      }
      //-------------------------------------------------------

      return res.status(200).json({
        postsCount: userPostsCount,
        data: userPosts,
      });
    } catch (error) {
      console.error(error);

      return res
        .status(500)
        .json({ errorMessage: "서버에서 에러가 발생하였습니다." });
    }
  },
);

// ==============================================================================
/** 마이페이지 회원정보 조회 */
router.get("/users/self/profile", authMiddleware, profileController.getProfile);

/** 마이페이지 게시글 목록 조회 */
router.get(
  "/users/self/profile/posts",
  authMiddleware,
  profileController.getMyPosts,
);

/** 마이페이지 북마크 목록 조회 */
router.get(
  "/users/self/profile/bookmark",
  authMiddleware,
  profileController.getMyBookmarks,
);

/** 마이페이지 내 정보 수정 */
router.patch(
  "/users/self/profile/edit",
  upload.single("imgUrl"),
  authMiddleware,
  profileController.editMyInfo,
);

/** 다른 유저의 프로필 조회 */
router.get(
  "/users/profile/:nickname",
  authMiddleware,
  profileController.viewOtherProfile,
);

/** 다른 유저의 프로필에서 그 사람이 쓴 게시글 목록 조회 */
router.get(
  "/users/profile/:nickname/posts",
  profileController.viewPostsFromOtherProfile,
);

export default router;
