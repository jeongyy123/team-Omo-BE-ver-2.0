// __tests__/unit/posts.service.unit.spec.js

import { jest } from "@jest/globals";
import { CommentsService } from "../../../src/services/comments.service.js";

let mockCommentsRepository = {
  findPostById: jest.fn(), // 수정
  findAllComments: jest.fn(),
  createComment: jest.fn(),
  findCommentById: jest.fn(),
  deleteComment: jest.fn(),
  decrementCommentCount: jest.fn(),
};


let commentsService = new CommentsService(mockCommentsRepository);

describe("Posts Service Unit Test", () => {
  // 각 test가 실행되기 전에 실행됩니다.
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("createComment Method", async () => {
    const userId = 1;
    const postId = 1;
    const content = "안녕하세요 테스트 입니다.";

    const testComment = [
      {
        userId: 1,
        postId: 1,
        content: "안녕하세요 테스트 입니다.",
        replyCount: 0,
        createdAt: "2024-01-06T13:43:38.744Z",
      },
    ];
    mockCommentsRepository.findPostById.mockReturnValue(testComment);

    mockCommentsRepository.createComment.mockReturnValue(testComment);

    const createComments = await commentsService.createComment(
      userId,
      +postId,
      content,
    );

    expect(mockCommentsRepository.findPostById).toHaveBeenCalledWith(postId);
    expect(mockCommentsRepository.createComment).toHaveBeenCalledWith(
      userId,
      +postId,
      content,
    );
    expect(mockCommentsRepository.createComment).toHaveBeenCalledTimes(1);
  });

  test("getComments Method", async () => {
  const postId = 1;
  const page = 1;
  const lastSeenId = null;

  const postMock = { postId: 1, };
  const testComments = [  
    {
          userId: 1,
          nickname: "대한사람",
          commentId: 1,
          content: "asdffeffeeddsss",
          replyCount: 0,
          createdAt: "2024-01-06T13:43:38.621Z",
  }];
  const commentsWithImagesMock = [ "https://kyeongmin-bucket.s3.ap-northeast-2.amazonaws.com/d0db3d0d46859ef2ae003b9e5a9340272a84d82e4b35c545fe60fc6ee436c1b9?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4N5A3AWU32OWQI32%2F20240106%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20240106T134352Z&X-Amz-Expires=900&X-Amz-Signature=0fd5c9fe90cb5a78e4289aa16bc84eeb0b53114123aa94a2fa5aa6572b824e3c&X-Amz-SignedHeaders=host&x-id=GetObject" ];

  // commentsRepository에서 데이터를 모의 반환
  mockCommentsRepository.findPostById.mockReturnValue(postMock);
  mockCommentsRepository.findAllComments.mockReturnValue(testComments);
  // 이미지 가져오는 로직의 결과를 모의 반환
  commentsService.getCommentsWithImages = jest.fn().mockReturnValue(commentsWithImagesMock);

  const result = await commentsService.getComments(postId, page, lastSeenId);

  expect(result).toBe(commentsWithImagesMock);
  expect(mockCommentsRepository.findPostById).toHaveBeenCalledWith(postId);
  expect(mockCommentsRepository.findAllComments).toHaveBeenCalledWith(+postId, page, lastSeenId);
  expect(commentsService.getCommentsWithImages).toHaveBeenCalledWith(testComments);
});

test("deletePost Method By Success", async () => {
  const deleteParams = {
    commentId: 1,
    userId: 1
  }

  const testComment = {
    userId: deleteParams.userId,
    nickname: "대한사람",
    commentId: deleteParams.commentId,
    content: "asdffeffeeddsss",
    replyCount: 0,
    createdAt: "2024-01-06T13:43:38.621Z",
  }

  mockCommentsRepository.findCommentById.mockReturnValue(testComment);  

  await commentsService.deleteComment(
    deleteParams.commentId,
    deleteParams.userId
  );

  expect(mockCommentsRepository.findCommentById).toHaveBeenCalledTimes(1);
  expect(mockCommentsRepository.findCommentById).toHaveBeenCalledWith(
    deleteParams.commentId,
  );
});

test("deleteComment Method By Not Found Post Error", async () => {
  const userId = 1;
  const commentId = 1;

  const testComment = null;

  mockCommentsRepository.findCommentById.mockReturnValue(testComment);

  try {
    await commentsService.deleteComment(userId, commentId);
  } catch (error) {
    expect(mockCommentsRepository.findCommentById).toHaveBeenCalledTimes(1);

    expect(error.message).toEqual('댓글을 찾을 수 없습니다.');
  }
});
});
