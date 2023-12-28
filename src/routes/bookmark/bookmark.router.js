import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * paths:
 *  /posts/:locationId/bookmark:
 *    post:
 *      summary: 사용자가 원하는 장소를 북마크를 할 수 있습니다.
 *      description: 로그인에 성공한 사용자는 원하는 장소에 북마크를 할 수 있습니다.
 *      tags:
 *        - Bookmark
 *      responses:
 *        '201':
 *          description: 사용자가 한 장소 북마크를 성공한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 북마크
 *        '400':
 *          description: |
 *            1. 장소가 존재하지 않는 경우
 *            2. 사용자가 이미 북마크한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 장소가 존재하지 않거나 이미 북마크한 장소입니다.
 *        '500':
 *          description: 서버에서 에러가 발생했을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

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

/**
 * @swagger
 * paths:
 *  /posts/:locationId/bookmark:
 *    delete:
 *      summary: 사용자가 원하는 장소의 북마크를 취소할 수 있습니다.
 *      description: 로그인한 사용자는 원하는 장소의 북마크를 취소할 수 있습니다.
 *      tags:
 *        - Bookmark
 *      parameters:
 *        - name: locationId
 *          in: path
 *          description: 북마크를 취소할 장소의 ID
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: 사용자가 북마크를 성공적으로 취소한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 북마크 취소
 *        '400':
 *          description: |
 *            1. 장소가 존재하지 않는 경우
 *            2. 사용자가 이미 북마크 취소한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 장소가 존재하지 않거나 이미 북마크 취소한 장소입니다.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

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

/**
 * @swagger
 * paths:
 *  /posts/user/bookmark:
 *    get:
 *      summary: 로그인한 사용자의 북마크된 장소 목록을 조회합니다.
 *      description: 로그인한 사용자의 북마크된 장소 목록을 지도에 표시하기 위한 API입니다.
 *      tags:
 *        - Bookmark
 *      responses:
 *        '200':
 *          description: 사용자의 북마크된 장소 목록을 성공적으로 조회한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    Location:
 *                      type: object
 *                      properties:
 *                        locationId:
 *                          type: number
 *                          description: 북마크된 장소의 Id
 *                        latitude:
 *                          type: number
 *                          description: 북마크된 장소의 위도
 *                        longitude:
 *                          type: number
 *                          description: 북마크된 장소의 경도
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 서버에서 에러가 발생했습니다.
 */

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
    return res.status(200).json(userBookmark);
  } catch (error) {
    next(error);
  }
});

export default router;
