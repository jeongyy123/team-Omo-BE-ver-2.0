import { RepliesRepository } from "../repositories/replies.repository.js";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "../utils/prisma/index.js";
import dotenv from "dotenv";

dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey,
  },
  region: bucketRegion,
});

export class RepliesService {
  repliesRepository = new RepliesRepository();

  createReply = async (userId, commentId, content) => {
    const comment = await this.repliesRepository.findCommentById(commentId);

    if (!comment) {
      const error = new Error("댓글을 찾을수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    const reply = await this.repliesRepository.createReply(
      userId,
      commentId,
      content,
    );
    return reply;
  };

  // 조회
  getReplies = async (commentId, page, lastSeenId) => {
    const comment = await this.repliesRepository.findCommentById(commentId);

    if (!comment) {
      const error = new Error("이미 삭제되었거나, 없는 댓글입니다.");
      error.statusCode = 404;
      throw error;
    }

    const replies = await this.repliesRepository.findAllReplies(
      commentId,
      page,
      lastSeenId,
    );

    if (!replies) {
      const error = new Error("댓글을 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    const replysWithImages = await this.getRepliesWithImagesFromS3(replies);

    return replysWithImages;
  };

  getRepliesWithImagesFromS3 = async (replies) => {
    return Promise.all(
      replies.map(async (reply) => {
        if (reply.User.imgUrl && reply.User.imgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: reply.User.imgUrl,
          };

          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command);

          reply.User.imgUrl = url;
        }
        return reply;
      }),
    );
  };

  // 삭제
  deleteReply = async (userId, replyId, commentId) => {
    const reply = await this.repliesRepository.findReplyById(replyId);

    if (!reply) {
      const error = new Error("댓글을 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    await prisma.$transaction(async (prisma) => {
      const deleteReply = await this.repliesRepository.deleteReply(
        userId,
        replyId,
        commentId,
      );

      if (!deleteReply) {
        const error = new Error("댓글을 삭제할 권한이 없습니다.");
        error.statusCode = 403;
        throw error;
      }

      await this.repliesRepository.decrementReplyCount(commentId);
    });
    return { message: "댓글이 삭제되었습니다." };
  };
}
