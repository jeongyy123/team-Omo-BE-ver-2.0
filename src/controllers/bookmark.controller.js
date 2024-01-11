export class BookmarkController {
  constructor(bookmarkService) {
    this.bookmarkService = bookmarkService;
  };
  /* 북마크 */
  createBookmark = async (req, res, next) => {
    try {
      const { locationId } = req.params;
      const { userId } = req.user;

      await this.bookmarkService.createBookmark(locationId, userId);

      return res.status(201).json({ message: "북마크" });
    } catch (error) {
      next(error);
    }
  };

  /* 북마크 취소 */
  deleteBookmark = async (req, res, next) => {
    try {
      const { locationId } = req.params;
      const { userId } = req.user;

      await this.bookmarkService.deleteBookmark(locationId, userId);

      return res.status(200).json({ message: "북마크 취소" });
    } catch (error) {
      next(error);
    }
  };

  /** 유저의 북마크 지도 표시**/
  getUserMapBookmarks = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const userBookmark =
        await this.bookmarkService.getUserMapBookmarks(userId);

      return res.status(200).json(userBookmark);
    } catch (error) {
      next(error);
    }
  };
}
