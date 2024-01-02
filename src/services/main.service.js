import { MainRepository } from '../repositories/main.repository.js';
import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";


dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: bucketRegion,
});

export class MainService {

  mainRepository = new MainRepository();

  /* 인기글 조회 */
  getPoplurPosts = async (districtName, limit) => {
    const popularPosts = await this.mainRepository.getPoplurPosts(districtName, limit);

    if (!popularPosts || popularPosts === 0) {
      const err = new Error("해당 인기글이 없어요")
      err.statusCode = 400;
      throw err;
    }

    //이미지 반환하는 로직
    const imgUrlsArray = popularPosts.map((post) => post.imgUrl.split(","));
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
          commands.map((command) => getSignedUrl(s3, command)),
        );
        return urls;
      }),
    );

    for (let i = 0; i < popularPosts.length; i++) {
      popularPosts[i].imgUrl = signedUrlsArray[i];
    }

    return popularPosts;
  }

  /* 최신글 조회 */
  getRecentPosts = async (districtName, limit, categoryName) => {
    const parsedLimit = +limit || 9;

    if (!parsedLimit || parsedLimit <= 0) {
      const err = new Error("limit값을 입력해주세요")
      err.statusCode = 400;
      throw err;
    }

    const recentPosts = await this.mainRepository.getRecentPosts(districtName, limit, categoryName);

    if (!recentPosts || recentPosts === 0) {
      const err = new Error("해당 최신글이 없어요")
      err.statusCode = 400;
      throw err;
    }

    //이미지 반환하는 로직
    const imgUrlsArray = recentPosts.map((post) => post.imgUrl.split(","));
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
          commands.map((command) => getSignedUrl(s3, command)),
        );
        return urls;
      }),
    );

    for (let i = 0; i < recentPosts.length; i++) {
      recentPosts[i].imgUrl = signedUrlsArray[i];
    }

    return recentPosts;
  }

  /* 댓글 조회 */
  getRecentComments = async (districtName, limit) => {
    const recentComments = await this.mainRepository.getRecentComments(districtName, limit);

    if (!recentComments) {
      const err = new Error("해당 댓글이 없어요.")
      err.statusCode = 400;
      throw err;
    }
    return recentComments;
  }
}