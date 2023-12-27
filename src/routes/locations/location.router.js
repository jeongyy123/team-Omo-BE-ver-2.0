import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import haversine from "haversine";
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
import { getManyImagesS3 } from "../../utils/getImageS3.js"

dotenv.config();

const router = express.Router();
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


/**
 * @swagger
 * /locations:
 *   get:
 *     summary: 지도페이지에서 주변 둘러보기
 *     description: 화면에서 보여지는 지도에서 가운데 기준으로 가까운 게시글을 조회한다.
 *     tags:
 *      - Locations
 *     parameters:
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: 조회할 카테고리 이름 ('음식점', '카페', '기타', '전체')
 *       - in: query
 *         name: qa
 *         schema:
 *           type: string
 *         description: latitude의 최소값
 *       - in: query
 *         name: pa
 *         schema:
 *           type: string
 *         description: latitude의 최대값
 *       - in: query
 *         name: ha
 *         schema:
 *           type: string
 *         description: longitude의 최소값
 *       - in: query
 *         name: oa
 *         schema:
 *           type: string
 *         description: longitude의 최대값
 *     responses:
 *       200:
 *         description: 사용자가 지도에서 성공적으로 주변 게시물을 불러왔을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postsCount:
 *                   type: number
 *                   description: 사용자가 보고있는 화면에서 나타나는 게시글의 갯수
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                       description: 사용자가 해당하는 게시물을 클릭했을 경우
 *                     Posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: number
 *                             description: 게시글의 고유 번호
 *                           UserId:
 *                             type: number
 *                             description: 작성한 사용자의 고유 번호
 *                           imgUrl:
 *                             type: string
 *                             description: 게시글 이미지
 *                           content:
 *                             type: string
 *                             description: 게시글 내용
 *                           likeCount:
 *                             type: number
 *                             description: 게시글 좋아요 갯수
 *                           commentCount:
 *                             type: number
 *                             description: 게시글의 댓글 갯수
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             description: 게시글 작성 날짜
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             description: 게시글이 업데이트 된 날짜
 *                           Comments:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 UserId:
 *                                   type: number
 *                                   description: 댓글을 작성한 사용자의 고유 번호
 *                                 PostId:
 *                                   type: number
 *                                   description: 댓글이 달린 게시글의 고유 번호
 *                                 content:
 *                                   type: string
 *                                   description: 댓글 내용
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                   description: 댓글이 작성된 날짜
 *                                 User:
 *                                   type: object
 *                                   properties:
 *                                     nickname:
 *                                       type: string
 *                                       description: 댓글을 작성한 사용자 닉네임.
 *                                     imgUrl:
 *                                       type: string
 *                                       description: 댓글을 작성한 사용자의 닉네임
 *       '500':
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

//둘러보기
router.get("/locations", async (req, res, next) => {
  try {
    const { categoryName } = req.query;
    const { qa, pa, ha, oa } = req.query;


    if (!categoryName || !['음식점', '카페', '기타', '전체'].includes(categoryName)) {
      return res.status(400).json({ message: "올바른 카테고리를 입력하세요." });
    }

    let category;
    if (categoryName !== '전체') {
      category = await prisma.categories.findFirst({
        where: { categoryName },
      });
    } else {
      category = { categoryId: null };
    }

    console.log("category >>>>>>>> ", category)

    // 위치 정보 가져오기
    const location = await prisma.locations.findMany({
      where: {
        latitude: {
          gte: qa,
          lte: pa
        },
        longitude: {
          gte: ha,
          lte: oa
        },
        ...(category?.categoryId && { CategoryId: category.categoryId }),
      },
      select: {
        locationId: true,
        storeName: true,
        address: true,
        latitude: true,
        longitude: true,
        starAvg: true,
        postCount: true,
        Category: {
          select: {
            categoryName: true,
          },
        },
        Posts: {
          select: {
            postId: true,
            star: true,
            imgUrl: true,
          },
        },
      },
    });

    console.log("location >>>>>>>> ", location)

    const latitude = ((Number(qa) + Number(pa)) / 2).toFixed(10)
    const longitude = ((Number(ha) + Number(oa)) / 2).toFixed(10)

    // // // 거리 계산 및 정렬
    const start = {
      latitude: +latitude || qa,
      longitude: +longitude || ha
    }

    // 게시글 개수, 거리차 추가
    const locationsWithDistance = await Promise.all(
      location.map(async (loc) => {
        const distance = +haversine(
          start,
          { latitude: loc.latitude, longitude: loc.longitude },
          { unit: "meter" },
        ).toFixed(10);
        return {
          ...loc
        };
      }),
    );

    // 이미지 배열로 반환하는 로직
    const imgUrlsArray = locationsWithDistance
      .sort((a, b) => a.distance - b.distance);

    const paramsArray = imgUrlsArray.flatMap((arr) => {
      return arr.Posts.map((post) => {
        // 콤마로 구분된 여러 URL 분리
        const imgUrls = post.imgUrl.split(",");

        // 각 URL에 대해 Bucket 및 Key 속성을 가진 객체로 변환
        return imgUrls.map((url) => ({
          Bucket: bucketName,
          Key: url,
        }));
      });
    });

    console.log("paramsArray >>>>>>>> ", paramsArray)

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

    console.log("signedUrlsArray >>>>>>>> ", signedUrlsArray)

    for (let i = 0; i < imgUrlsArray.length; i++) {
      imgUrlsArray[i].Posts.map((post) => {
        post.imgUrl = signedUrlsArray[i]
      })
    }

    console.log("imgUrlsArray >>>>>>>> ", imgUrlsArray)

    return res.status(200).json(imgUrlsArray);
  } catch (error) {
    console.log(error)
    next(error);
  }
});

/**
 * @swagger
 * /locations/:locationId:
 *   get:
 *     summary: 인기 게시글 조회
 *     description: 특정 위치의 인기 게시글과 위치 정보를 조회한다.
 *     tags:
 *      - Locations
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 위치의 고유 식별자
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: string
 *         description: 선택적으로 조회할 위치의 latitude
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: string
 *         description: 선택적으로 조회할 위치의 longitude
 *     responses:
 *       200:
 *         description: 성공적으로 위치와 게시글 정보를 불러왔을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   type: object
 *                   properties:
 *                     locationId:
 *                       type: number
 *                       description: 위치의 고유 식별자
 *                     address:
 *                       type: string
 *                       description: 위치의 주소
 *                     starAvg:
 *                       type: number
 *                       description: 위치에 대한 별점 평균
 *                     postCount:
 *                       type: number
 *                       description: 위치에 속한 게시글의 수
 *                     storeName:
 *                       type: string
 *                       description: 위치의 상점 이름
 *                     Posts:
 *                       type: object
 *                       properties:
 *                         imgUrl:
 *                           type: string
 *                           description: 위치에 속한 게시글의 이미지 URL (첫 번째 이미지만 사용)
 *                 posts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       User:
 *                         type: object
 *                         properties:
 *                           nickname:
 *                             type: string
 *                             description: 게시글 작성자의 닉네임
 *                           imgUrl:
 *                             type: string
 *                             description: 게시글 작성자의 이미지 URL
 *                       postId:
 *                         type: number
 *                         description: 게시글의 고유 식별자
 *                       imgUrl:
 *                         type: string
 *                         description: 게시글의 이미지 URL
 *                       content:
 *                         type: string
 *                         description: 게시글의 내용
 *                       commentCount:
 *                         type: number
 *                         description: 게시글의 댓글 수
 *                       likeCount:
 *                         type: number
 *                         description: 게시글의 좋아요 수
 *                       star:
 *                         type: number
 *                         description: 게시글의 평점
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 게시글 작성 날짜
 *       400:
 *         description: 요청이 잘못된 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "locationId 요청 송신에 오류가 있습니다."
 *       500:
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




// // 인기게시글 
// // 해당 하는 지역에 postId, latitude, longitude, 별점, content, likeCount
// // commentCount, imgUrl, createdAt
router.get("/locations/:locationId", async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query
    const { locationId } = req.params

    if (!locationId) {
      return res.status(400).json({ message: "locationId 요청 송신에 오류가 있습니다." })
    }

    const location = await prisma.locations.findFirst({
      where: {
        locationId: +locationId // locationId를 정수로 변환하는 것은 필요 없습니다.
      },
      select: {
        locationId: true,
        address: true,
        starAvg: true,
        postCount: true, // postcount -> postCount로 수정
        storeName: true,
        placeInfoId: true,
        Posts: {
          select: {
            imgUrl: true
          }
        }
      }
    });

    // 16진수로 바꾼 imgUrl 을 , 기준으로 split 해주기
    const locationImgUrlsArray = location.Posts[0].imgUrl.split(",")

    const locationParamsArray = locationImgUrlsArray.map((imgUrl) => ({
      Bucket: bucketName,
      Key: imgUrl
    }))

    const locationSignedUrlsArray = await Promise.all(
      locationParamsArray.map(async (params) => {
        const command = new GetObjectCommand(params);
        const signedUrl = await getSignedUrl(s3, command);
        return signedUrl;
      }),
    );

    location.Posts[0].imgUrl = locationSignedUrlsArray[0]

    const posts = await prisma.posts.findMany({
      where: {
        LocationId: +locationId
      },
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true
          }
        },
        postId: true,
        imgUrl: true,
        content: true,
        commentCount: true,
        likeCount: true,
        star: true,
        createdAt: true
      }
    })

    // 좋아요 순서로 정렬
    const sortedPosts = posts.sort((a, b) => b.likeCount - a.likeCount)

    await getManyImagesS3(sortedPosts)


    for (const post of sortedPosts) {
      const params = {
        Bucket: bucketName,
        Key: post.User.imgUrl
      }
      const command = new GetObjectCommand(params);
      const imgUrl = await getSignedUrl(s3, command);
      post.User.imgUrl = imgUrl
    }

    return res.status(200).json({ location, posts: posts });
  } catch (error) {
    next(error)
  }
});


export default router;