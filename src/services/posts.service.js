import { PostsRepository } from '../repositories/posts.repository.js'
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getManyImagesS3, getSingleImageS3, getImageS3 } from "../utils/getImageS3.js";
import crypto from "crypto";
import jimp from "jimp";
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

export class PostsService {
  postsRepository = new PostsRepository();

  /* 게시글 목록 조회 */
  findAllPosts = async (page, lastSeenPage, categoryName, districtName) => {
    const posts = await this.postsRepository.findAllPosts(page, lastSeenPage, categoryName, districtName);

    await getManyImagesS3(posts);

    return posts
  }

  /* 게시글 상세 조회 */
  findPostById = async (postId) => {
    const post = await this.postsRepository.findPostById(postId);

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.")
      err.statusCode = 404;
      throw err;
    }

    await getSingleImageS3(post.User);
    await getImageS3(post);

    return post
  }

  /* 게시글 작성 */
  createPost = async (userId,
    content,
    categoryName,
    storeName,
    address,
    latitude,
    longitude,
    star,
    placeInfoId,
    files) => {

    const imgNames = await this.processPutImages(files);

    const category = await this.postsRepository.findCategory(categoryName);

    if (!category) {
      const err = new Error("존재하지않는 카테고리입니다.")
      err.statusCode = 404;
      throw err;
    }

    const district = await this.postsRepository.findDistrict(address);

    if (!district) {
      const err = new Error("지역이 존재하지 않습니다.")
      err.statusCode = 404;
      throw err;
    }

    await this.postsRepository.createPost(
      userId,
      content,
      categoryName,
      storeName,
      address,
      latitude,
      longitude,
      star,
      placeInfoId,
      imgNames
    );

    return {
      message: "게시글 등록이 완료되었습니다."
    }
  }

  /* 게시글 작성 중 이미지 등록 처리*/
  processPutImages = async (files) => {
    //이미지 이름 나눠서 저장
    if (!files || files.length === 0) {
      const err = new Error("사진을 등록해주세요.")
      err.statusCode = 400;
      throw err;
    }

    const imgPromises = files.map(async (file) => {
      if (file.size > 6000000) {
        const err = new Error("3MB이하의 이미지파일만 넣어주세요.")
        err.statusCode = 400;
        throw err;
      }

      const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
      const imgName = randomImgName();

      // 이미지 사이즈 조정
      const buffer = await jimp
        .read(file.buffer)
        .then((image) =>
          image
            .resize(jimp.AUTO, 500)
            .quality(70)
            .getBufferAsync(jimp.MIME_JPEG),
        );

      const params = {
        Bucket: bucketName,
        Key: imgName,
        Body: buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);

      return imgName;
    });
    return Promise.all(imgPromises)
  }

  /* 게시글 수정 */
  updatePost = async (userId, postId, address, content, star, storeName, placeInfoId, latitude, longitude, categoryName) => {
    const post = await this.postsRepository.findPostByPostIdAndUserId(userId, postId);

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.")
      err.statusCode = 400;
      throw err;
    }

    if (post.UserId !== userId) {
      const err = new Error("수정할 권한이 존재하지 않습니다.")
      err.statusCode = 401;
      throw err;
    }

    await this.postsRepository.updatePost(userId, postId, address, content, star, storeName, placeInfoId, latitude, longitude, categoryName)

    return {
      message: "게시물을 수정하였습니다."
    }
  }

  /* 게시글 찾기 by PostId, UserId */
  findPostByPostIdAndUserId = async (userId, postId) => {
    const post = await this.postsRepository.findPostByPostIdAndUserId(userId, postId);

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.")
      err.statusCode = 400;
      throw err;
    }
    return post;
  }

  /* 게시글 삭제 */
  deletePost = async (userId, postId) => {
    const post = await this.postsRepository.findPostByPostIdAndUserId(userId, postId);

    if (!post) {
      const err = new Error("존재하지않는 게시글입니다.")
      err.statusCode = 400;
      throw err;
    }

    if (post.UserId !== userId) {
      const err = new Error("삭제할 권한이 존재하지 않습니다.")
      err.statusCode = 401;
      throw err;
    }

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

    await this.postsRepository.deletePost(userId, postId);

    return {
      message: "게시글을 삭제하였습니다."
    }
  }

}