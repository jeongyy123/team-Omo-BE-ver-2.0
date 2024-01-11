import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { prisma } from '../utils/prisma/index.js';
import { BookmarkRepository } from "../repositories/bookmark.repository.js";
import { BookmarkService } from "../services/bookmark.service.js";
import { BookmarkController } from "../controllers/bookmark.controller.js";

const router = express.Router();

const bookmarkRepository = new BookmarkRepository(prisma);
const bookmarkService = new BookmarkService(bookmarkRepository);
const bookmarkController = new BookmarkController(bookmarkService);

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
