// import { beforeEach, describe, expect, jest } from '@jest/globals';
// import { IsLikeService } from '../../../src/services/isLike.service';

// let mockIsLikeRepository = {
//   createLike: jest.fn(),
//   deleteLike: jest.fn(),
//   findPostByPostId: jest.fn(),
//   findLikeByPostIdAndUserId: jest.fn(),
//   getLikedPostsByUser: jest.fn()
// };

// let islikeService = new IsLikeService(mockIsLikeRepository);

// describe('IsLike Service Unit Test', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   test('createLike Method', async () => {
//     const findPostReturn = {
//       postId: 1,
//       UserId: 1,
//       LocationId: 1,
//       title: 'testTitle',
//       content: 'testContent',
//       likeCount: 1,
//       createdAt: '2021-08-25T00:00:00.000Z',
//       updatedAt: '2021-08-25T00:00:00.000Z',
//     };

//     const findPostParams = {
//       postId: 1,
//     };

//     const findLikeReturn = null;

//     const findLikeParams = {
//       PostId: 1,
//       UserId: 1,
//     };

//     const createLikeReturn = { message: "좋아요" };

//     const createLikeParams = {
//       PostId: 1,
//       UserId: 1
//     }


//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn)
//     mockIsLikeRepository.findLikeByPostIdAndUserId.mockReturnValue(findLikeReturn)
//     mockIsLikeRepository.createLike.mockReturnValue(createLikeReturn);

//     const createLike = await islikeService.createLike(
//       createLikeParams.PostId,
//       createLikeParams.UserId
//     );

//     expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(findPostParams.postId);

//     expect(mockIsLikeRepository.findLikeByPostIdAndUserId).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.findLikeByPostIdAndUserId).toHaveBeenCalledWith(findLikeParams.PostId, findLikeParams.UserId);


//     expect(createLike).toEqual(createLikeReturn);
//     expect(mockIsLikeRepository.createLike).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.createLike).toHaveBeenCalledWith(
//       createLikeParams.PostId,
//       createLikeParams.UserId,
//     );

//   });

//   test('createLike Method By 해당 게시글이 존재하지 않습니다', async () => {
//     const findPostReturn = null;

//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn);

//     try {
//       await islikeService.createLike(1, 1);
//     } catch (error) {
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(error.message).toEqual("해당 게시글이 존재하지 않습니다.")
//     }
//   });

//   test('createLike Method By 이미 좋아요한 게시글입니다', async () => {
//     const findPostReturn = {
//       postId: 1,
//       UserId: 1,
//       LocationId: 1,
//       title: 'testTitle',
//       content: 'testContent',
//       likeCount: 1,
//       createdAt: '2021-08-25T00:00:00.000Z',
//       updatedAt: '2021-08-25T00:00:00.000Z',
//     };

//     const findLikeReturn = {
//       likeId: 1,
//       UserId: 1,
//       PostId: 1
//     };

//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn);
//     mockIsLikeRepository.findLikeByPostIdAndUserId.mockReturnValue(findLikeReturn);

//     try {
//       await islikeService.createLike(1, 1);
//     } catch (error) {
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(error.message).toEqual("이미 좋아요한 게시글입니다.")
//     }
//   });

//   test('deleteLike Method', async () => {
//     const deleteLikeReturn = { message: "좋아요 취소" }

//     const findLikeReturn = {
//       likeId: 1,
//       PostId: 1,
//       UserId: 1,
//     };

//     const findPostReturn = {
//       postId: 1,
//       UserId: 1,
//       LocationId: 1,
//       title: 'testTitle',
//       content: 'testContent',
//       likeCount: 1,
//       createdAt: '2021-08-25T00:00:00.000Z',
//       updatedAt: '2021-08-25T00:00:00.000Z',
//     };
//     const deleteReturn = { message: "좋아요 취소" };

//     const findLikeParams = {
//       PostId: 1,
//       UserId: 1
//     };

//     const findPostParams = {
//       postId: 1,
//     };

//     const deleteLikeParams = {
//       postId: 1,
//       userId: 1,
//     };

//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn);
//     mockIsLikeRepository.findLikeByPostIdAndUserId.mockReturnValue(findLikeReturn);
//     mockIsLikeRepository.deleteLike.mockReturnValue(deleteLikeReturn);

//     const deleteLike = await islikeService.deleteLike(deleteLikeParams.postId, deleteLikeParams.userId);

//     expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(findPostParams.postId);

//     expect(mockIsLikeRepository.findLikeByPostIdAndUserId).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.findLikeByPostIdAndUserId).toHaveBeenCalledWith(findLikeParams.PostId, findLikeParams.UserId);

//     expect(mockIsLikeRepository.deleteLike).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.deleteLike).toHaveBeenCalledWith(deleteLikeParams.postId, deleteLikeParams.userId);

//     expect(deleteLike).toEqual(deleteReturn)


//   });

//   test('deleteLike Method By 해당 게시글이 존재하지 않습니다', async () => {
//     const findPostReturn = null;

//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn);

//     try {
//       await islikeService.deleteLike(1, 1);
//     } catch (error) {
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(error.message).toEqual("해당 게시글이 존재하지 않습니다.")
//     }
//   })

//   test('deleteLike Method By 이미 좋아요 취소한 게시글입니다', async () => {
//     const findPostReturn = {
//       postId: 1,
//       UserId: 1,
//       LocationId: 1,
//       title: 'testTitle',
//       content: 'testContent',
//       likeCount: 1,
//       createdAt: '2021-08-25T00:00:00.000Z',
//       updatedAt: '2021-08-25T00:00:00.000Z',
//     };

//     const findLikeReturn = null;

//     mockIsLikeRepository.findPostByPostId.mockReturnValue(findPostReturn);
//     mockIsLikeRepository.findLikeByPostIdAndUserId.mockReturnValue(findLikeReturn);

//     try {
//       await islikeService.deleteLike(1, 1);
//     } catch (error) {
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.findPostByPostId).toHaveBeenCalledWith(1);

//       expect(error.message).toEqual("이미 좋아요 취소한 게시글입니다.")
//     }
//   })

//   test('getLikedPostsByUser Method', async () => {
//     const getLikedPostsReturn = {
//       likeId: 1,
//       PostId: 1,
//       UserId: 1,
//       Post: {
//         Location: {
//           locationId: 1
//         }
//       }
//     };

//     const getLikedPostsByUserParams = {
//       UserId: 1,
//     };

//     mockIsLikeRepository.getLikedPostsByUser.mockReturnValue(getLikedPostsReturn);

//     const getLikePosts = await islikeService.getLikedPostsByUser(getLikedPostsByUserParams.UserId);

//     expect(getLikePosts).toEqual(getLikedPostsReturn);

//     expect(mockIsLikeRepository.getLikedPostsByUser).toHaveBeenCalledTimes(1);
//     expect(mockIsLikeRepository.getLikedPostsByUser).toHaveBeenCalledWith(getLikedPostsByUserParams.UserId);
//   });

//   test('getLikedPostsByUser Method By 좋아요한 게시글이 없습니다', async () => {
//     const getLikedPostsReturn = null;

//     mockIsLikeRepository.getLikedPostsByUser.mockReturnValue(getLikedPostsReturn);
//     try {
//       await islikeService.getLikedPostsByUser(1);
//     } catch (error) {
//       expect(mockIsLikeRepository.getLikedPostsByUser).toHaveBeenCalledTimes(1);
//       expect(mockIsLikeRepository.getLikedPostsByUser).toHaveBeenCalledWith(1);

//       expect(error.message).toEqual("좋아요한 게시글이 없습니다.")
//     }
//   });
// })