import {
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from 'multer';
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

export const deleteImageS3 = async (post) => {
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

}