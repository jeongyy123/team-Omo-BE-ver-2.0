import express from "express";
import multer from "multer";
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

//1개의 게시글 - 1개 이미지 조회
export const getSingleImageS3 = async (post) => {
  const param = {
    Bucket: bucketName,
    Key: post.imgUrl
  }

  const command = new GetObjectCommand(param);
  const imgUrl = await getSignedUrl(s3, command);

  return post.imgUrl = imgUrl
}

// 1개의 게시글 - 여러 개 이미지 조회
export const getImageS3 = async (post) => {
  const imgUrlsArray = post.imgUrl.split(",");
  const paramsArray = imgUrlsArray.map((url) => ({
    Bucket: bucketName,
    Key: url,
  }));

  const signedUrlsArray = await Promise.all(
    paramsArray.map(async (params) => {
      const command = new GetObjectCommand(params);
      const signedUrl = await getSignedUrl(s3, command);
      return signedUrl;
    }),
  );

  return post.imgUrl = signedUrlsArray;
}


// 여러 개의 게시글 - 여러 개 이미지 조회
export const getManyImagesS3 = async (posts) => {
  // 이미지 배열로 반환하는 로직
  const imgUrlsArray = posts.map((post) => post.imgUrl.split(","));

  const paramsArray = imgUrlsArray.map((urls) =>
    urls.map((url) => ({
      Bucket: bucketName,
      Key: url,
    })),
  );

  const signedUrlsArray = await Promise.all(
    paramsArray.map(async (params) => {
      const commands = params.map((param) => new GetObjectCommand(param));
      const urls = await Promise.all(
        commands.map((command) => getSignedUrl(s3, command)),
      );
      return urls;
    }),
  );

  for (let i = 0; i < posts.length; i++) {
    posts[i].imgUrl = signedUrlsArray[i];
  }
}

// 댓글 여러 유저들의 프로필 이미지
export const getProfileImageS3 = async (posts) => {
  posts.map(async (post) => {
    const params = {
      Bucket: bucketName,
      Key: post.User.imgUrl
    }
    const command = new GetObjectCommand(params);
    const imgUrl = await getSignedUrl(s3, command);
    return post.User.imgUrl = imgUrl
  })
}