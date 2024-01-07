import { LocationRepository } from "../repositories/location.repository.js";
import haversine from "haversine";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { getManyImagesS3 } from "../utils/getImageS3.js";
import dotenv from "dotenv";

dotenv.config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const imageName = randomImageName(); // file name will be random

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: bucketRegion,
});

export class LocationService {
  locationRepository = new LocationRepository();

  // 둘러보기 위치 정보가져오기
  getSurroundLocation = async (categoryName, qa, pa, ha, oa) => {
    // 위치 정보 조회
    const locations = await this.locationRepository.findAroundPosts(
      categoryName,
      qa,
      pa,
      ha,
      oa,
    );


    // 이미지 URL 서명 및 가공
    const locationsWithImages = await this.getLocationsWithImages(
      locations,
      qa,
      pa,
      ha,
      oa,
    );

    return locationsWithImages;
  };

  // 거리 계산 및 정렬
  calculateDistances = (locations, start) => {
    return Promise.all(
      locations.map(async (loc) => {
        const distance = +haversine(
            start,
            { latitude: loc.latitude, longitude: loc.longitude },
            { unit: "meter" },
        )
        return {
          ...loc,
          distance: +distance.toFixed(10)
        };
      }),
    );
  };

  // 이미지 배열로 반환하는 로직
  getLocationsWithImages = async (locations, qa, pa, ha, oa) => {
    // 중심 좌표 계산
    const latitude = ((Number(qa) + Number(pa)) / 2).toFixed(10);
    const longitude = ((Number(ha) + Number(oa)) / 2).toFixed(10);
    const start = {
      latitude: +latitude || qa,
      longitude: +longitude || ha,
    };


    // 거리 계산 및 정렬
    const locationsWithDistance = await this.calculateDistances(
      locations,
      start,
    );

    const imgUrlsArray = locationsWithDistance.sort(
      (a, b) => a.distance - b.distance,
    );

    // 이미지 배열로 반환하는 로직
    const paramsArray = imgUrlsArray.map((arr) =>
      arr.Posts[0].imgUrl.split(",").flatMap((url) => ({
        Bucket: bucketName,
        Key: url,
      })),
    );

    if (!paramsArray || paramsArray.length === 0) {
      const error = new Error("아직 등록된 사진이 없거나, 없는가게 입니다.");
      error.statusCode = 400;
      throw error;
    }

    // 이미지 URL 서명 및 반환
    const signedUrlsArray = await Promise.all(
      paramsArray.map(async (locationParams) => {
        const locationSignedUrls = await Promise.all(
          locationParams.map(async (params) => {
            const commands = new GetObjectCommand(params);
            return await getSignedUrl(s3, commands);
          }),
        );

        return locationSignedUrls;
      }),
    );

    // 이미지 URL들을 locations 배열에 추가
    const locationsWithSignedUrls = locationsWithDistance.map(
      (location, locationIndex) => ({
        ...location,
        Posts: location.Posts.map((post, postIndex) => ({
          ...post,
          imgUrl: signedUrlsArray[locationIndex][postIndex],
        })),
      }),
    );

    return locationsWithSignedUrls;
  };

  // 인기
  getPopularLocation = async (locationId) => {
    const location =
      await this.locationRepository.findPopularLocation(locationId);

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



    return location;
  }

  getPopularPosts = async (locationId) => {
    const posts = await this.locationRepository.findPopularPosts(locationId);


    // 좋아요 순서로 정렬
    const sortedPosts = posts.sort((a, b) => b.likeCount - a.likeCount);


    await getManyImagesS3(sortedPosts);

    for (const post of sortedPosts) {
        if (post.User.imgUrl && post.User.imgUrl.length === 64) {
          const params = {
            Bucket: bucketName,
            Key: post.User.imgUrl
          }
          const command = new GetObjectCommand(params);
          const imgUrl = await getSignedUrl(s3, command);
          post.User.imgUrl = imgUrl
        }
      }
    return sortedPosts
  }


}
