
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();


const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey
  },
  region: bucketRegion,
});

export class CommentsService {
  // commentsRepository = new CommentsRepository();
  constructor (commentsRepository) { // 추가
    this.commentsRepository = commentsRepository;// 추가
  }
  // 등록

  createComment = async (userId, postId, content) => {
    const post = await this.commentsRepository.findPostById(postId);

    if (!post) {
      const error = new Error("게시물을 찾을수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    const comment = await this.commentsRepository.createComment(
      userId,
      +postId,
      content,
    );

    return comment;
  };
  // 조회
  getComments = async (postId, page, lastSeenId) => {
    const post = await this.commentsRepository.findPostById(postId);

    if (!post) {
      const error = new Error("댓글을 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    const comments = await this.commentsRepository.findAllComments(
      +postId,
      page,
      lastSeenId,
    );

    // 이미지 가져오기 로직을 서비스 내부로 이동
    const commentsWithImages = await this.getCommentsWithImages(comments);

    return commentsWithImages;
  };

  // 이미지 가져오기 로직을 서비스 내부로 이동
  getCommentsWithImages = async (comments) => {
    return Promise.all(
      comments.map(async (comment) => {
        if (comment.User.imgUrl && comment.User.imgUrl.length === 64) {
          const getObjectParams = {
            Bucket: bucketName, // 버킷 이름
            Key: comment.User.imgUrl, // 이미지 키
          };

          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command);

          comment.User.imgUrl = url;
        }
        return comment;
      }),
    );
  };

  // 삭제
  deleteComment = async (userId, commentId, postId) => {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      const error = new Error("댓글을 찾을 수 없습니다.");
      error.statusCode = 404;
      throw error;
    }

    const deleteComment = await this.commentsRepository.deleteComment(
      userId,
      +commentId,
    );

    await this.commentsRepository.decrementCommentCount(postId);
  };
}
