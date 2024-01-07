// // __tests__/unit/posts.service.unit.spec.js

// import { jest } from "@jest/globals";
// import { CommentsService } from "../../../src/services/posts.service.js";

// // CommentsRepository는 아래의 5개 메서드만 지원하고 있습니다.
// let mockCommentsRepository = {
//   findAllComments: jest.fn(),
//   findPostById: jest.fn(),
//   createComment: jest.fn(),
//   decrementCommentCount: jest.fn(),
//   deleteComment: jest.fn(),
// };

// // commentsService의 Repository를 Mock Repository로 의존성을 주입합니다.
// let commentsService = new CommentsService(mockCommentsRepository);

// describe("Posts Service Unit Test", () => {
//   // 각 test가 실행되기 전에 실행됩니다.
//   beforeEach(() => {
//     jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
//   });

//   test("findAllComments Method", async () => {
//     const testComment = [
//       {
//         userId: 1,
//         nickname: "대한사람",
//         imgUrl:
//           "https://kyeongmin-bucket.s3.ap-northeast-2.amazonaws.com/d0db3d0d46859ef2ae003b9e5a9340272a84d82e4b35c545fe60fc6ee436c1b9?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4N5A3AWU32OWQI32%2F20240103%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20240103T163725Z&X-Amz-Expires=900&X-Amz-Signature=3aa44eaffc245760d22207914e89c137fc3645a5d79da419433b8a2b3d3d976e&X-Amz-SignedHeaders=host&x-id=GetObject",
//       },
//       {
//         postId: 6,
//       },
//       {
//         commentId: 1,
//         content: "ㄹㅇㄴㅁㄹㅇㄴㅁㄹㅇ",
//         replyCount: 0,
//         createdAt: "2024-01-02T11:41:42.601Z",
//       },
//       {
//         userId: 1,
//         nickname: "대한사람",
//         imgUrl:
//           "https://kyeongmin-bucket.s3.ap-northeast-2.amazonaws.com/d0db3d0d46859ef2ae003b9e5a9340272a84d82e4b35c545fe60fc6ee436c1b9?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA4N5A3AWU32OWQI32%2F20240103%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Date=20240103T163725Z&X-Amz-Expires=900&X-Amz-Signature=3aa44eaffc245760d22207914e89c137fc3645a5d79da419433b8a2b3d3d976e&X-Amz-SignedHeaders=host&x-id=GetObject",
//       },
//       {
//         postId: 6,
//       },
//       {
//         commentId: 2,
//         content: "ㄹㅇㄴㅁㄹㅇㄴㅁㄹㅇ",
//         replyCount: 0,
//         createdAt: "2024-02-02T11:41:42.601Z",
//       },
//     ];

//     mockCommentsRepository.findAllComments.mockReturnValue(testComment);

//     const allComment = await commentsService.findAllComments();

//     expect(allComment).toEqual(
//         testComment.sort((a, b) => {
//             return b.createdAt - a.createdAt
//         })
//     )
//     expect(mockCommentsRepository.findAllComments).toHaveBeenCalledTimes(1);``
//   });

//   test("deletePost Method By Success", async () => {
//     // TODO: 여기에 코드를 작성해야합니다.
//   });

//   test("deletePost Method By Not Found Post Error", async () => {
//     // TODO: 여기에 코드를 작성해야합니다.
//   });
// });
