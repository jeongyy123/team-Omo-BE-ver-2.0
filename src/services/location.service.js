// import { LocationRepository } from "../repositories/location.repository.js";
// import haversine from "haversine";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import crypto from "crypto";
// import dotenv from "dotenv";

// dotenv.config();

// const randomImageName = (bytes = 32) =>
//   crypto.randomBytes(bytes).toString("hex");

// const imageName = randomImageName(); // file name will be random

// const bucketName = process.env.BUCKET_NAME;
// const bucketRegion = process.env.BUCKET_REGION;
// const accessKey = process.env.ACCESS_KEY;
// const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// const s3 = new S3Client({
//   credentials: {
//     accessKeyId: process.env.ACCESS_KEY,
//     secretAccessKey: process.env.SECRET_ACCESS_KEY,
//   },
//   region: bucketRegion,
// });

// export class LocationService {
//     locationRepository = new LocationRepository();

//     getSurroundLocation = async 
// }