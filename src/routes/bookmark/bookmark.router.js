import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

// 북마크
router.post(
  "/posts/:locationId/bookmark",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { locationId } = req.params;
      const { userId } = req.user;

      const location = await prisma.locations.findFirst({
        where: { locationId: +locationId },
      });

      if (!location) {
        return res.status(400).json({ message: "장소가 존재하지 않습니다." });
      }

      const bookmark = await prisma.bookmark.findFirst({
        where: { LocationId: +locationId, UserId: +userId },
      });

      if (!bookmark) {
        await prisma.bookmark.create({
          data: {
            LocationId: +locationId,
            UserId: +userId,
          },
        });
      } else {
        return res.status(400).json({ message: "이미 북마크한 장소입니다." });
      }

      return res.status(201).json({ message: "북마크" });
    } catch (error) {
      next(error);
    }
  },
);


//북마크 취소
router.delete(
  "/posts/:locationId/bookmark",
  authMiddleware,
  async (req, res, next) => {
    try {
      const { locationId } = req.params;
      const { userId } = req.user;

      const location = await prisma.locations.findFirst({
        where: { locationId: +locationId },
      });

      if (!location) {
        return res.status(400).json({ message: "장소가 존재하지 않습니다." });
      }

      const bookmark = await prisma.bookmark.findFirst({
        where: { LocationId: +locationId, UserId: +userId },
      });

      if (bookmark) {
        await prisma.bookmark.delete({
          where: { bookmarkId: bookmark.bookmarkId },
        });
      } else {
        return res
          .status(400)
          .json({ message: "이미 북마크 취소한 장소입니다." });
      }

      return res.status(200).json({ message: "북마크 취소" });
    } catch (error) {
      next(error);
    }
  },
);


// 유저의 북마크 지도 표시
router.get("/posts/user/bookmark", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

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

    if (!userBookmark) {
      return res.status(404).json({ message: "사용자가 북마크한 장소가 없습니다." })
    }

    return res.status(200).json(userBookmark);
  } catch (error) {
    next(error);
  }
});

export default router;
