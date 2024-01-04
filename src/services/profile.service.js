import { ProfileRepositoty } from "../repositories/profile.repository.js";

import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jimp from "jimp";
import crypto from "crypto";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const router = express.Router();

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

export class ProfileService {
  profileRepository = new ProfileRepositoty();

  fetchMyPageUserInfo = async (userId) => {
    const userInfo = await this.profileRepository.fetchMyPageUserInfo(userId);

    // 데이터베이스에 저장되어 있는 이미지 주소는 64자의 해시 또는 암호화된 값이기 때문
    if (userInfo.imgUrl && userInfo.imgUrl.length === 64) {
      const getObjectParams = {
        Bucket: bucketName, // 버킷 이름
        Key: userInfo.imgUrl, // 이미지 키
      };

      // User GetObjectCommand to create the url
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command);
      userInfo.imgUrl = url;
    }

    return userInfo;
  };

  getUserPostsCount = async (userId) => {
    const myPostsCount = await this.profileRepository.getUserPostsCount(userId);

    return myPostsCount;
  };

  fetchUserPosts = async (userId, pageSize, lastPostId) => {
    const userPosts = await this.profileRepository.fetchUserPosts(
      userId,
      pageSize,
      lastPostId,
    );

    for (let i = 0; i < userPosts.length; i++) {
      const imgUrls = userPosts[i].imgUrl.split(",");
      console.log("imgUrls >>>", imgUrls);

      const imgUrl = [];

      for (let j = 0; j < imgUrls.length; j++) {
        const currentImgUrl = imgUrls[j];
        console.log("currentImgUrl >>>>", currentImgUrl);

        if (currentImgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: currentImgUrl,
          };

          try {
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command);
            imgUrl.push(url);
          } catch (error) {
            console.error(
              `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
              error,
            );
          }
        } else {
          imgUrl.push(currentImgUrl);
        }
      }

      userPosts[i].imgUrl = imgUrl;
    }

    return userPosts;
  };

  fetchMyBookmarksCount = async (userId) => {
    const favouritePlaces =
      await this.profileRepository.fetchMyBookmarksCount(userId);

    return favouritePlaces;
  };

  fetchMyBookmarkedPlaces = async (userId, pageSize, lastBookmarkId) => {
    const favouritePlaces =
      await this.profileRepository.fetchMyBookmarkedPlaces(
        userId,
        pageSize,
        lastBookmarkId,
      );

    for (let i = 0; i < favouritePlaces.length; i++) {
      const firstPostImagesPerLocation =
        favouritePlaces[i].Location.Posts[0].imgUrl.split(",");

      console.log(
        "firstPostImagesPerLocation  >>>>>>>>>>>>",
        firstPostImagesPerLocation,
      );

      const imgUrl = [];

      for (const currentImgUrl of firstPostImagesPerLocation) {
        if (currentImgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: currentImgUrl,
          };

          try {
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command);
            imgUrl.push(url);
          } catch (error) {
            console.error(
              `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
              error,
            );
            imgUrl.push("");
          }
        } else {
          imgUrl.push(currentImgUrl);
        }
      }
      favouritePlaces[i].Location.Posts[0].imgUrl = imgUrl;
    }

    return favouritePlaces;
  };

  updateUserInfo = async (
    userId,
    file,
    nickname,
    newPassword,
    confirmedPassword,
  ) => {
    const imageName = randomImageName();

    // ** 이미지가 수정되었는지 확인 **
    if (file) {
      const image = await jimp.read(file.buffer);
      const processedImage = await image
        .resize(jimp.AUTO, 150) // 이미지 크기 조절
        .quality(70) // 이미지 품질 설정
        .getBufferAsync(jimp.AUTO); // 버퍼로 변환

      // S3에 보낼 버퍼 처리
      const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: processedImage,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      await this.profileRepository.updateProfileImage(userId, imageName);
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
      const user = await this.profileRepository.checkIfUserExists(userId);

      if (newPassword !== confirmedPassword) {
        return res.status(400).json({
          errorMessage: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 이전의 비밀번호와 같은 비밀번호를 입력했을 때
      const isSamePassword = await bcrypt.compare(newPassword, user.password);

      if (isSamePassword) {
        return res
          .status(401)
          .json({ errorMessage: "이미 이전의 비밀번호와 일치합니다." });
      }

      await this.profileRepository.updateUserPassword(userId, hashedPassword);
    }

    if (nickname !== undefined) {
      await this.profileRepository.updateUserNickname(userId, nickname);
    }

    return {
      message: "회원정보가 수정되었습니다.",
    };
  };

  getOtherUserProfile = async (nickname) => {
    const otherUserInfo =
      await this.profileRepository.getOtherUserProfile(nickname);

    if (!otherUserInfo) {
      const err = new Error("해당 사용자를 찾을 수 없습니다.");
      err.statusCode = 404;
      throw err;
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

    return otherUserInfo;
  };

  getOtherUserPostsCount = async (nickname) => {
    const findUserId = await this.profileRepository.findUserId(nickname);

    if (!findUserId) {
      const err = new Error("해당 사용자를 찾을 수 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    //??
    const userPostsCount = await this.profileRepository.getOtherUserPostsCount(
      findUserId.userId,
    );

    return userPostsCount;
  };

  fetchOtherUserPostsList = async (nickname, pageSize, lastPostId) => {
    const findUserId = await this.profileRepository.findUserId(nickname);

    if (!findUserId) {
      const err = new Error("해당 사용자를 찾을 수 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    const userPosts = await this.profileRepository.fetchOtherUserPostsList(
      findUserId.userId,
      pageSize,
      lastPostId,
    );

    for (let i = 0; i < userPosts.length; i++) {
      const imgUrls = userPosts[i].imgUrl.split(",");
      console.log("imgUrls >>>", imgUrls);

      const imgUrl = [];

      for (let j = 0; j < imgUrls.length; j++) {
        const currentImgUrl = imgUrls[j];
        console.log("currentImgUrl >>>>", currentImgUrl);

        if (currentImgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: currentImgUrl,
          };

          try {
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command);
            imgUrl.push(url);
          } catch (error) {
            console.error(
              `${currentImgUrl}을 가져오면서 문제가 발생하였습니다.`,
              error,
            );
          }
        } else {
          imgUrl.push(currentImgUrl);
        }
      }

      userPosts[i].imgUrl = imgUrl;
    }

    return userPosts;
  };
}
