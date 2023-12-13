import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import { searchingSchema } from "../../validations/searching.validation.js";

const router = express.Router();

/* 검색 기능 (유저, 가게 이름) */
//아직 어떤 페이지 뜰 지 미정
router.get('/posts/main/searching', async (req, res, next) => {
  try {
    const validation = await searchingSchema.validateAsync(req.body);
    const { nickname, storeName } = validation;
    if (!nickname && !storeName) {
      return res.status(400).json({ message: "nickname 또는 storeName을 입력해주세요." })

    }
    let resultData;
    if (nickname) {
      const users = await prisma.users.findMany({
        select: {
          nickname: true,
          imgUrl: true
        },
        where: {
          nickname: {
            contains: nickname
          }
        }
      });
      if (!users || users === 0) {
        return res.status(400).json({ message: "검색하신 유저의 정보가 없어요." })
      }
      resultData = users;
    }


    if (storeName) {
      const stores = await prisma.locations.findFirst({
        where: {
          storeName: {
            contains: storeName
          }
        }
      });

      if (!stores || stores === 0) {
        return res.status(400).json({ message: "검색하신 가게 정보가 없어요." })
      }
      resultData = stores;
    }

    return res.status(200).json({ data: resultData })
  } catch (error) {
    next(error)
  }
})

export default router;
