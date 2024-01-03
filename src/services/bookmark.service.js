import { BookmarkRepository } from "../repositories/bookmark.repository.js";

export class BookmarkService {
  bookmarkRepository = new BookmarkRepository();

  createBookmark = async (locationId, userId) => {
    const findLocationByLocationId =
      await this.bookmarkRepository.findLocationByLocationId(locationId);

    if (!findLocationByLocationId) {
      const err = new Error("장소가 존재하지 않습니다.");
      err.statusCode = 400;
      throw err;
    }

    const findBookmarkByLocationIdAndUserId =
      await this.bookmarkRepository.findBookmarkByLocationIdAndUserId(
        locationId,
        userId,
      );

    if (findBookmarkByLocationIdAndUserId) {
      const err = new Error("이미 북마크한 장소입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.bookmarkRepository.createBookmark(locationId, userId);

    return {
      message: "북마크",
    };
  };

  deleteBookmark = async (locationId, userId) => {
    const findLocationByLocationId =
      await this.bookmarkRepository.findLocationByLocationId(locationId);

    if (!findLocationByLocationId) {
      const err = new Error("장소가 존재하지 않습니다.");
      err.statusCode = 400;
      throw err;
    }

    const findBookmarkByLocationIdAndUserId =
      await this.bookmarkRepository.findBookmarkByLocationIdAndUserId(
        locationId,
        userId,
      );

    if (!findBookmarkByLocationIdAndUserId) {
      const err = new Error("이미 북마크 취소한 장소입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.bookmarkRepository.deleteBookmark(locationId, userId);

    return {
      message: "북마크 취소",
    };
  };

  findLocationByLocationId = async (locationId) => {
    const location =
      await this.bookmarkRepository.findLocationByLocationId(locationId);

    return location;
  };

  findBookmarkByLocationIdAndUserId = async (locationId, userId) => {
    const bookmark =
      await this.bookmarkRepository.findBookmarkByLocationIdAndUserId(
        locationId,
        userId,
      );

    return bookmark;
  };

  getUserMapBookmarks = async (userId) => {
    const userBookmark =
      await this.bookmarkRepository.getUserMapBookmarks(userId);

    if (!userBookmark) {
      const err = new Error("사용자가 북마크한 장소가 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    return {
      userBookmark,
    };
  };
}
