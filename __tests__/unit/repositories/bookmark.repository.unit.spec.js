// import { describe, expect, jest, test } from "@jest/globals";
// import { BookmarkRepository } from "../../../src/repositories/bookmark.repository.js";

// let mockPrisma = {
//   bookmark: {
//     create: jest.fn(),
//     findFirst: jest.fn(),
//     delete: jest.fn(),
//     findMany: jest.fn(),
//   },
//   locations: {
//     findFirst: jest.fn(),
//   },
// };

// let bookmarkRepository = new BookmarkRepository(mockPrisma);

// describe("Bookmark Repository Unit Test", () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   test('createBookmark Method', async () => {
//     const mockReturn = { message: "북마크" };
//     mockPrisma.bookmark.create.mockReturnValue(mockReturn);

//     const createBookmarkParams = {
//       locationId: 1,
//       userId: 1
//     };

//     const createBookmarkData = await bookmarkRepository.createBookmark(
//       createBookmarkParams.locationId,
//       createBookmarkParams.userId
//     );

//     expect(createBookmarkData).toEqual(mockReturn);
//     expect(mockPrisma.bookmark.create).toHaveBeenCalledTimes(1);
//     expect(mockPrisma.bookmark.create).toHaveBeenCalledWith(
//       {
//         data: {
//           LocationId: createBookmarkParams.locationId,
//           UserId: createBookmarkParams.userId
//         }
//       }
//     )
//   });

//   test('deleteBookmark Method', async () => {
//     const mockReturn = { message: "북마크 취소" };
//     mockPrisma.bookmark.delete.mockReturnValue(mockReturn);

//     const deleteBookmarkIdParams = {
//       bookmarkId: 1
//     }
//     // 인자로 received할 내용이 들어가야한다.
//     const deleteBookmarkData = await bookmarkRepository.deleteBookmark(deleteBookmarkIdParams.bookmarkId);

//     expect(deleteBookmarkData).toEqual(mockReturn);
//     expect(mockPrisma.bookmark.delete).toHaveBeenCalledTimes(1);

//     // 인자로 expected할 내용이 들어가야한다.
//     expect(mockPrisma.bookmark.delete).toHaveBeenCalledWith({
//       where: deleteBookmarkIdParams
//     });
//   });

//   test('findLocationByLocationId Method', async () => {
//     const mockReturn = {
//       locationId: 1,
//       latitude: "37.1111",
//       longitude: "127.1111"
//     };

//     const findLocationParams = {
//       locationId: 1
//     };

//     mockPrisma.locations.findFirst.mockReturnValue(mockReturn);

//     const findLocationByLocationIdData = await bookmarkRepository.findLocationByLocationId(findLocationParams.locationId);

//     expect(findLocationByLocationIdData).toEqual(mockReturn);
//     expect(mockPrisma.locations.findFirst).toHaveBeenCalledTimes(1);
//     expect(mockPrisma.locations.findFirst).toHaveBeenCalledWith({
//       where: findLocationParams
//     })
//   });

//   test('findBookmarkByLocationIdAndUserId Method', async () => {
//     const mockReturn = {
//       bookmarkId: 1,
//       UserId: 1,
//       LocationId: 1,
//       createdAt: "2024-01-08T11:25:43.154Z"
//     };

//     // 컬럼명도 맞춰줘야한다.
//     const findLocationParams = {
//       LocationId: 1,
//       UserId: 1
//     };

//     mockPrisma.bookmark.findFirst.mockReturnValue(mockReturn);

//     const findBookmarkByLocationIdAndUserIdData = await bookmarkRepository.findBookmarkByLocationIdAndUserId(findLocationParams.LocationId, findLocationParams.UserId);

//     expect(findBookmarkByLocationIdAndUserIdData).toEqual(mockReturn);
//     expect(mockPrisma.bookmark.findFirst).toHaveBeenCalledTimes(1);
//     expect(mockPrisma.bookmark.findFirst).toHaveBeenCalledWith({
//       where: findLocationParams
//     });
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

//     mockPrisma.bookmark.findMany.mockReturnValue(mockReturn);

//     const getUserMapBookmarksData = await bookmarkRepository.getUserMapBookmarks(getUserMapBookmarksParams);

//     expect(getUserMapBookmarksData).toEqual(mockReturn);
//     expect(mockPrisma.bookmark.findMany).toHaveBeenCalledTimes(1);
//   })
// });