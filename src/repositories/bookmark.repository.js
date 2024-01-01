import { prisma } from "../utils/prisma/index.js";

export class BookmarkRepository {
  createBookmark = async (locationId, userId) => {
    await prisma.bookmark.create({
      data: {
        LocationId: +locationId,
        UserId: +userId,
      },
    });
    return { message: "북마크" }
  }

  deleteBookmark = async (locationId, userId) => {
    const bookmark = await prisma.bookmark.findFirst({
      where: { LocationId: +locationId, UserId: +userId },
    });

    await prisma.bookmark.delete({
      where: { bookmarkId: bookmark.bookmarkId },
    });
    return { message: "북마크 취소" }
  }

  findLocationByLocationId = async (locationId) => {
    return await prisma.locations.findFirst({
      where: { locationId: +locationId },
    });
  }

  findBookmarkByLocationIdAndUserId = async (locationId, userId) => {
    return await prisma.bookmark.findFirst({
      where: { LocationId: +locationId, UserId: +userId },
    });
  }

  getUserMapBookmarks = async (userId) => {
    const userBookmark = await prisma.bookmark.findMany({
      where: { UserId: +userId },
      select: {
        Location: {
          select: {
            locationId: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });
    return userBookmark;
  }
}