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

export const fileFilter = (req, file, next) => {
  // const allowedTypes = ["image/webp"];
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    // const error = new Error("webp 확장자만 입력해주세요.");
    const error = new Error("jpeg, jpg, png, webp만 입력해주세요.");
    error.code = "INCORRECT_FILETYPE";
    return next(error, false);
  }

  next(null, true);
};

/* 게시글 작성 중 이미지 등록 처리*/
export const processPutImages = async (files) => {
  //이미지 이름 나눠서 저장
  if (!files || files.length === 0) {
    const err = new Error("사진을 등록해주세요.");
    err.statusCode = 400;
    throw err;
  }

  const imgPromises = files.map(async (file) => {
    if (file.size > 6000000) {
      const err = new Error("3MB이하의 이미지파일만 넣어주세요.");
      err.statusCode = 400;
      throw err;
    }

    const randomImgName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");
    const imgName = randomImgName();

    let params;
    if (file.mimetype === "image/webp") {
      params = {
        Bucket: bucketName,
        Key: imgName,
        Body: file.buffer, //jimp 사용 시 buffer로 바꿔야함
        ContentType: file.mimetype,
      };
    } else {
      // 이미지 사이즈 조정
      const buffer = await jimp
        .read(file.buffer)
        .then((image) =>
          image
            .resize(jimp.AUTO, 500)
            .quality(70)
            .getBufferAsync(jimp.MIME_JPEG),
        );

      params = {
        Bucket: bucketName,
        Key: imgName,
        Body: buffer, //jimp 사용 시 buffer로 바꿔야함
        ContentType: file.mimetype,
      };
    }
    const command = new PutObjectCommand(params);
    await s3.send(command);

    return imgName;
  });
  return Promise.all(imgPromises);
};