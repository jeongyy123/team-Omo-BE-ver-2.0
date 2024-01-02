import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { BookmarkController } from "../controllers/bookmark.controller.js";

const router = express.Router();

const bookmarkController = new BookmarkController();

/** 북마크 **/
router.post(
  "/posts/:locationId/bookmark",
  authMiddleware,
  bookmarkController.createBookmark,
);

/** 북마크 취소 **/
router.delete(
  "/posts/:locationId/bookmark",
  authMiddleware,
  bookmarkController.deleteBookmark,
);

/** 유저의 북마크 지도 표시**/
router.get(
  "/posts/user/bookmark",
  authMiddleware,
  bookmarkController.getUserMapBookmarks,
);

export default router;
