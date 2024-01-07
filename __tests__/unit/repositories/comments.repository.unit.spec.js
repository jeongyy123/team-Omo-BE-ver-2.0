// // __tests__/unit/posts.repository.unit.spec.js

// import { jest } from '@jest/globals';
// import { CommentsRepository } from '../../../src/repositories/comments.repository';

// // Prisma 클라이언트에서는 아래 5개의 메서드만 사용합니다.
// let mockPrisma = {
//   comments: {
//     findMany: jest.fn(),
//     findFirst: jest.fn(),
//     create: jest.fn(),
//     delete: jest.fn(),
//   },
//   posts: {
//     update: jest.fn(),
//   }
// };

// let commentsRepository = new CommentsRepository(mockPrisma);

// describe('Comments Repository Unit Test', () => {

//   // 각 test가 실행되기 전에 실행됩니다.
//   beforeEach(() => {
//     jest.resetAllMocks(); // 모든 Mock을 초기화합니다.
//   })

//   test('findAllComments Method', async () => {
//     const mockReturn = 'findFirst String';
//     mockPrisma.comments.findMany.mockReturnValue(mockReturn);

//     const comments = await commentsRepository.findAllComments();

//     expect(comments).toBe(mockReturn);

//     expect(commentsRepository.prisma.comments.findMany).toHaveBeenCalledTimes(1);
//   });


//   test('createComments Method', async () => {
//     const mockReturn = 'Create Comment Return String';
//     mockPrisma.comments.create.mockReturnValue(mockReturn);

//     const createCommentParams = {
//       UserId: 'createCommentUserId',
//       PostId: 'createCommentPostId',
//       content: 'createCommentContent'
//     }

//     const createCommentData = await commentsRepository.createComment(
//       createCommentParams.UserId,
//       Number(createCommentParams.PostId),  
//       createCommentParams.content
//     );

//     expect(createCommentData).toEqual(mockReturn);

//     expect(mockPrisma.comments.create).toHaveBeenCalledTimes(1);

//     expect(mockPrisma.comments.create).toHaveBeenCalledWith({
//       data: {
//         UserId: createCommentParams.UserId,
//         PostId: Number(createCommentParams.PostId),
//         content: createCommentParams.content
//       }
//     })
//   });

// });