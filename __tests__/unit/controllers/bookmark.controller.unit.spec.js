// import { beforeEach, describe, expect, jest } from '@jest/globals';
// import { BookmarkController } from '../../../src/controllers/bookmark.controller.js';
// import e from 'express';

// const mockBookmarkService = {
//   createBookmark: jest.fn(),
//   deleteBookmark: jest.fn(),
//   getUserMapBookmarks: jest.fn(),
// };

// const mockRequest = {
//   params: jest.fn(),
//   user: jest.fn(),
// }

// const mockResponse = {
//   status: jest.fn(),
//   json: jest.fn(),
// };

// const mockNext = jest.fn();

// const bookmarkController = new BookmarkController(mockBookmarkService);

// describe('Bookmark Controller Unit Test', () => {
//   beforeEach(() => {
//     jest.resetAllMocks();

//     mockResponse.status.mockReturnValue(mockResponse);
//   });

//   test('createBookmark Method', async () => {
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

//     const createBookmarkLocationParams = {
//       locationId: 1,
//     };

//     const createBookmarkUserParams = {
//       userId: 1,
//     };

//     mockRequest.params = createBookmarkLocationParams;
//     mockRequest.user = createBookmarkUserParams;

//     mockBookmarkService.createBookmark.mockReturnValue(sampleLocatoion);

//     await bookmarkController.createBookmark(mockRequest, mockResponse, mockNext);

//     expect(mockBookmarkService.createBookmark).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkService.createBookmark).toHaveBeenCalledWith(
//       createBookmarkLocationParams.locationId,
//       createBookmarkUserParams.userId
//     );

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(201);

//     expect(mockResponse.json).toHaveBeenCalledTimes(1);
//     expect(mockResponse.json).toHaveBeenCalledWith({ message: "북마크" });
//   });

//   test('deleteBookmark Method', async () => {
//     const mockReturn = { message: "북마크 취소" };

//     const deleteBookmarkLocationParams = {
//       locationId: 1,
//     };

//     const deleteBookmarkUserParams = {
//       userId: 1,
//     };

//     mockRequest.params = deleteBookmarkLocationParams;
//     mockRequest.user = deleteBookmarkUserParams;

//     mockBookmarkService.deleteBookmark.mockReturnValue(mockReturn);

//     await bookmarkController.deleteBookmark(mockRequest, mockResponse, mockNext);

//     expect(mockBookmarkService.deleteBookmark).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkService.deleteBookmark).toHaveBeenCalledWith(
//       deleteBookmarkLocationParams.locationId,
//       deleteBookmarkUserParams.userId
//     );

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(200);

//     expect(mockResponse.json).toHaveBeenCalledTimes(1);
//     expect(mockResponse.json).toHaveBeenCalledWith({ message: "북마크 취소" });

//   });

//   test('getUserMapBookmarks Method', async () => {
//     const sampleBookmarks = [
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

//     const getUserMapBookmarksUserParams = {
//       userId: 1,
//     };

//     mockRequest.user = getUserMapBookmarksUserParams;

//     mockBookmarkService.getUserMapBookmarks.mockReturnValue(sampleBookmarks);

//     await bookmarkController.getUserMapBookmarks(mockRequest, mockResponse, mockNext);

//     expect(mockBookmarkService.getUserMapBookmarks).toHaveBeenCalledTimes(1);
//     expect(mockBookmarkService.getUserMapBookmarks).toHaveBeenCalledWith(
//       getUserMapBookmarksUserParams.userId
//     );

//     expect(mockResponse.status).toHaveBeenCalledTimes(1);
//     expect(mockResponse.status).toHaveBeenCalledWith(200);

//     expect(mockResponse.json).toHaveBeenCalledTimes(1);
//     expect(mockResponse.json).toHaveBeenCalledWith(sampleBookmarks);
//   });
// })
