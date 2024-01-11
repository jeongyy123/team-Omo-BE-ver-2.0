// import { beforeEach, describe, expect, jest, test } from '@jest/globals';
// import { IsLikeController } from '../../../src/controllers/isLike.controller.js';

// const mockIsLikeService = {
//   createLike: jest.fn(),
//   deleteLike: jest.fn(),
//   getLikedPostsByUser: jest.fn()
// };

// const mockRequest = {
//   params: jest.fn(),
//   user: jest.fn(),
// };

// const mockResponse = {
//   status: jest.fn(),
//   json: jest.fn(),
// };

// const mockNext = jest.fn();

// const isLikeController = new IsLikeController(mockIsLikeService);

// describe('IsLike Controller Unit Test', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();

//     mockResponse.status.mockReturnValue(mockResponse);
//   });


//   test('createLike Method', async () => {
//     const createParams = {
//       postId: 1,
//     }
//     const createUserParams = {
//       userId: 1
//     }

//     mockRequest.params = createParams;
//     mockRequest.user = createUserParams;

//     const createLikeReturn = { message: "좋아요" }

//     mockIsLikeService.createLike.mockReturnValue(createLikeReturn);

//     await isLikeController.createLike(mockRequest, mockResponse, mockNext);

//     expect(mockIsLikeService.createLike).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeService.createLike).toHaveBeenCalledWith(createParams.postId, createUserParams.userId);

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(201);

//     expect(mockResponse.json).toHaveBeenCalledWith(createLikeReturn);
//   });

//   test('deleteLike Method', async () => {
//     const deleteParams = {
//       postId: 1,
//     }
//     const deleteUserParams = {
//       userId: 1
//     }

//     mockRequest.params = deleteParams;
//     mockRequest.user = deleteUserParams;

//     const deleteLikeReturn = { message: "좋아요 취소" }

//     mockIsLikeService.deleteLike.mockReturnValue(deleteLikeReturn);

//     await isLikeController.deleteLike(mockRequest, mockResponse, mockNext);

//     expect(mockIsLikeService.deleteLike).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeService.deleteLike).toHaveBeenCalledWith(deleteParams.postId, deleteUserParams.userId);

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(200);

//     expect(mockResponse.json).toHaveBeenCalledWith(deleteLikeReturn);
//   });

//   test('getLikedPostsByUser Method', async () => {
//     const getLikedPostsReturn = [
//       {
//         likeId: 1,
//         PostId: 1,
//         UserId: 1,
//         Post: {
//           Location: {
//             locationId: 1
//           }
//         }
//       },
//       {
//         likeId: 2,
//         PostId: 2,
//         UserId: 1,
//         Post: {
//           Location: {
//             locationId: 2
//           }
//         }
//       }
//     ]

//     const getLikedPostsByUserParams = {
//       userId: 1,
//     };

//     mockRequest.user = getLikedPostsByUserParams;

//     mockIsLikeService.getLikedPostsByUser.mockReturnValue(getLikedPostsReturn);

//     await isLikeController.getLikedPostsByUser(mockRequest, mockResponse, mockNext);

//     expect(mockIsLikeService.getLikedPostsByUser).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeService.getLikedPostsByUser).toHaveBeenCalledWith(getLikedPostsByUserParams.userId);

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(200);

//     expect(mockResponse.json).toHaveBeenCalledWith(getLikedPostsReturn);
//   });

// });