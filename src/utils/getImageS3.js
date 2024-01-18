import multer from "multer";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//1개의 게시글 - 1개 이미지 조회
export const getSingleImageS3 = async (post) => {
  if (post.imgUrl && post.imgUrl.length === 64) {
    const param = {
      Bucket: bucketName,
      Key: post.imgUrl,
    };

    const command = new GetObjectCommand(param);
    const imgUrl = await getSignedUrl(s3, command);

    return (post.imgUrl = imgUrl);
  }
};

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

  return (post.imgUrl = signedUrlsArray);
};

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
};

// 댓글 여러 유저들의 프로필 이미지
export const getProfileImageS3 = async (posts) => {
  await Promise.all(posts.map(async (post) => {
    if (post.User.imgUrl && post.User.imgUrl.length === 64) {
      const params = {
        Bucket: bucketName,
        Key: post.User.imgUrl,
      };
      const command = new GetObjectCommand(params);
      const imgUrl = await getSignedUrl(s3, command);
      return (post.User.imgUrl = imgUrl);
    }
  }));
};

// 대댓글 유저의 프로필 이미지
export const getRepliesImageS3 = async (comments) => {
  for (const comment of comments) {
    for (const reply of comment.Replies) {
      if (reply.User.imgUrl && reply.User.imgUrl.length === 64) {
        const params = {
          Bucket: bucketName,
          Key: reply.User.imgUrl,
        };
        const command = new GetObjectCommand(params);
        const imgUrl = await getSignedUrl(s3, command);

        reply.User.imgUrl = imgUrl;
      }
    }
  }
};

// // searching 프로필
// export const getSearchingProfile = async (findUsers) => {
//   const imgUrlPromises = findUsers.map(async (user) => {
//     // if (user.imgUrl && user.imgUrl.length !== 64) {
//     //   return user.imgUrl;
//     // }
//     const params = {
//       Bucket: bucketName,
//       Key: user.imgUrl,
//     };

//     const command = new GetObjectCommand(params);
//     const imgUrl = await getSignedUrl(s3, command);
//     return imgUrl;
//   });

//   const imgUrls = await Promise.all(imgUrlPromises);

//   findUsers.forEach((user, index) => {
//     user.imgUrl = imgUrls[index];
//   });
//   return findUsers;
// };

// searching 프로필
export const getSearchingProfile = async (findUsers) => {
  await Promise.all(findUsers.map(async (user) => {
    if (user.imgUrl && user.imgUrl.length === 64) {
      const params = {
        Bucket: bucketName,
        Key: user.imgUrl,
      };

      const command = new GetObjectCommand(params);
      const imgUrl = await getSignedUrl(s3, command);
      user.imgUrl = imgUrl;
      return user;
    }
  }));
};

