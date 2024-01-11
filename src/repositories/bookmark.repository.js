export class BookmarkRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  createBookmark = async (locationId, userId) => {
    await this.prisma.bookmark.create({
      data: {
        LocationId: +locationId,
        UserId: +userId,
      },
    });
    return { message: "북마크" };
  };

  deleteBookmark = async (bookmarkId) => {
    await this.prisma.bookmark.delete({
      where: { bookmarkId: +bookmarkId },
    });
    return { message: "북마크 취소" };
  };

  findLocationByLocationId = async (locationId) => {
    return await this.prisma.locations.findFirst({
      where: { locationId: +locationId },
    });
  };

  findBookmarkByLocationIdAndUserId = async (locationId, userId) => {
    return await this.prisma.bookmark.findFirst({
      where: { LocationId: +locationId, UserId: +userId },
    });
  };

  getUserMapBookmarks = async (userId) => {
    const userBookmark = await this.prisma.bookmark.findMany({
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
  };
}
