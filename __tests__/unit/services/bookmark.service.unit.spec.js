// import { beforeEach, expect, jest, test } from '@jest/globals';
// import { BookmarkService } from '../../../src/services/bookmark.service.js';

// let mockBookmarkRepository = {
//   createBookmark: jest.fn(),
//   deleteBookmark: jest.fn(),
//   findLocationByLocationId: jest.fn(),
//   findBookmarkByLocationIdAndUserId: jest.fn(),
//   getUserMapBookmarks: jest.fn(),
// };

// let bookmarkService = new BookmarkService(mockBookmarkRepository);

// describe('Bookmark Service Unit Test', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   test('createBookmark Method', async () => {
//     const mockReturn = { message: "북마크" };

//     const sampleBookmark = null;

//     const sampleLocatoion = {
//       locationId: 2,
//       CategoryId: 2,
//       DistrictId: 2,
//       storeName: "testStoreName",
//       address: "testAddress",
//       latitude: "37.1111",
//       longitude: "127.1111",
//       starAvg: 2,
//       postCount: 2,
//       placeInfoId: 2,
//     };

//     const createBookmarkParams = {
//       locationId: 2,
//       userId: 2,
//       bookmarkId: 2
//     };

//     mockBookmarkRepository.findLocationByLocationId.mockReturnValue(sampleLocatoion);
//     mockBookmarkRepository.findBookmarkByLocationIdAndUserId.mockReturnValue(sampleBookmark);
//     mockBookmarkRepository.createBookmark.mockReturnValue(mockReturn);

//     const createBookmark = await bookmarkService.createBookmark(createBookmarkParams.locationId, createBookmarkParams.userId);

//     expect(createBookmark).toEqual(mockReturn);
//     expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledWith(createBookmarkParams.locationId);

//     expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledWith(createBookmarkParams.locationId, createBookmarkParams.userId);

//     expect(mockBookmarkRepository.createBookmark).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.createBookmark).toHaveBeenCalledWith(createBookmarkParams.locationId, createBookmarkParams.userId);

//   });

//   test('deleteBookmark Method', async () => {
//     const sampleBookmark = {
//       bookmarkId: 1,
//       UserId: 1,
//       LocationId: 1,
//       createdAt: "2024-01-09T08:48:02.146Z"
//     };

//     const sampleLocatoion = {
//       locationId: 1,
//       CategoryId: 1,
//       DistrictId: 1,
//       storeName: "testStoreName",
//       address: "testAddress",
//       latitude: "37.1111",
//       longitude: "127.1111",
//       starAvg: 1,
//       postCount: 1,
//       placeInfoId: 1,
//     };

//     const mockReturn = { message: "북마크 취소" };

//     const deleteBookmarkParams = {
//       locationId: 1,
//       userId: 1,
//       bookmarkId: 1
//     };

//     //mockBookmarkRepository 메소드 값 설정
//     mockBookmarkRepository.findLocationByLocationId.mockReturnValue(sampleLocatoion);
//     mockBookmarkRepository.findBookmarkByLocationIdAndUserId.mockReturnValue(sampleBookmark);
//     mockBookmarkRepository.deleteBookmark.mockReturnValue(mockReturn);

//     const deleteBookmark = await bookmarkService.deleteBookmark(1, 1);

//     // 1. locationId로 findLocationByLocationId 찾기
//     expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledWith(
//       deleteBookmarkParams.locationId
//     );

//     // 2. lcationId, userId로 findBookmarkByLocationIdAndUserId 찾기
//     expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledWith(
//       deleteBookmarkParams.locationId,
//       deleteBookmarkParams.userId
//     );

//     expect(mockBookmarkRepository.deleteBookmark).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.deleteBookmark).toHaveBeenCalledWith(
//       deleteBookmarkParams.bookmarkId
//     );

//     expect(deleteBookmark).toEqual(mockReturn);
//   });

//   test('deleteBookmark Method By 장소가 존재하지 않습니다', async () => {
//     const sampleBookmark = null;

//     mockBookmarkRepository.findLocationByLocationId.mockReturnValue(sampleBookmark);

//     try {
//       await bookmarkService.deleteBookmark(2);
//     } catch (error) {
//       expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledTimes(1);
//       expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledWith(2);

//       expect(error.message).toEqual('장소가 존재하지 않습니다.');
//     }
//   })

//   test('deleteBookmark Method By 이미 북마크 취소한 장소입니다', async () => {
//     const sampleBookmark = null;

//     const sampleLocatoion = {
//       locationId: 1,
//       CategoryId: 1,
//       DistrictId: 1,
//       storeName: "testStoreName",
//       address: "testAddress",
//       latitude: "37.1111",
//       longitude: "127.1111",
//       starAvg: 1,
//       postCount: 1,
//       placeInfoId: 1,
//     };

//     mockBookmarkRepository.findLocationByLocationId.mockReturnValue(sampleLocatoion);
//     mockBookmarkRepository.findBookmarkByLocationIdAndUserId.mockReturnValue(sampleBookmark);

//     try {
//       await bookmarkService.deleteBookmark(1, 1);
//     } catch (error) {
//       expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledTimes(1);
//       expect(mockBookmarkRepository.findLocationByLocationId).toHaveBeenCalledWith(1);

//       expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledTimes(1);
//       expect(mockBookmarkRepository.findBookmarkByLocationIdAndUserId).toHaveBeenCalledWith(1, 1);

//       expect(error.message).toEqual("이미 북마크 취소한 장소입니다.");
//     }
//   })

//   test('getUserMapBookmarks Method', async () => {
//     const mockReturn = [
//       {
//         Location: {
//           locationId: 1,
//           latitude: "37.1111",
//           longitude: "127.1111"
//         }
//       },
//       {
//         Location: {
//           locationId: 2,
//           latitude: "37.2222",
//           longitude: "127.2222"
//         }
//       }
//     ];

//     const getUserMapBookmarksParams = {
//       UserId: 1
//     };

//     mockBookmarkRepository.getUserMapBookmarks.mockReturnValue(mockReturn);

//     const userBookmark = await bookmarkService.getUserMapBookmarks(getUserMapBookmarksParams.UserId);

//     expect(userBookmark).toEqual(mockReturn);

//     expect(mockBookmarkRepository.getUserMapBookmarks).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkRepository.getUserMapBookmarks).toHaveBeenCalledWith(getUserMapBookmarksParams.UserId);

//   });

//   test('getUserMapBookmarks Method By 사용자가 북마크한 장소가 없습니다', async () => {
//     const mockReturn = null;

//     const getUserMapBookmarksParams = {
//       UserId: 1
//     };

//     mockBookmarkRepository.getUserMapBookmarks.mockReturnValue(mockReturn);

//     try {
//       const userBookmark = await bookmarkService.getUserMapBookmarks(getUserMapBookmarksParams.UserId);
//     } catch (error) {
//       expect(mockBookmarkRepository.getUserMapBookmarks).toHaveBeenCalledTimes(1);
//       expect(mockBookmarkRepository.getUserMapBookmarks).toHaveBeenCalledWith(getUserMapBookmarksParams.UserId);
//       expect(error.message).toEqual('사용자가 북마크한 장소가 없습니다.');
//     }

//   })
// })
