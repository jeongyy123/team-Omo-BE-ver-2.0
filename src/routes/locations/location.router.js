import express from "express";
import { prisma } from "../../utils/prisma/index.js";
// import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();


// 모든 위치 (둘러보기)
router.get("/locations", async (req, res) => {
  const { latitude, longitude } = req.query;
  const location = await prisma.locations.findMany(
    res.status(200).json({ data: location }),
  );
});

//특정 위치 조회 (인기게시글 순서)
router.get("/posts/:locationId", async (req, res) => {

  // 거리순 점과 점 사이 거리 구하기
  const { locationId, latitude, longitude } = req.params;

  const p1 = { latitude, longitude }
  const p2 = await prisma.locations.findMany({
    where: { district },
    select: { latitude, longitude }
  })
  function district(p1, p2) {
    return Math.sqrt(Math.pow(p2.latitude - p1.latitude, 2) + Math.pow(p2.longitude - p1.longitude, 2))
  }



  const location = await prisma.locations.findMany({
    select: {
      Location: {
        address: true,
        latitude: true,
        longitude: true,
      },
      Posts: {
        select: {
          content: true,
          imgUrl: true,
          likeCount: true,
          starAvg: true,
          creatredAt: true
        },
        orderBy: {
          likeCount: 'desc'
        },
      },
      Categories: {
        select: {
          categoryName: true
        }
      }
    }
  })
  return res.status(200).json({ data: location })
})






export default router;











