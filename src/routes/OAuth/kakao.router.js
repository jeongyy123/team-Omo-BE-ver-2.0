import express from "express";
import passport from "passport";
import { prisma } from "../../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 사용자 정보를 요청마다 처리하는 미들웨어 생성
const getUserInfo = (req, res, next) => {
  // req 객체에 사용자 정보 저장
  req.userInfo = req.user;
  next();
};

// 로그인 라우터
router.get("/kakao", passport.authenticate("kakao", { session: false }));

// 로그인 후 콜백 라우터
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 비활성화
    failureRedirect: "/login",
  }),
  getUserInfo, // 사용자 정보 미들웨어 적용
  // Passport에서는 사용자 정보를 req.user에 저장
  async (req, res) => {
    try {
      if (req.user) {
        // 사용자 정보는 req.user에 저장
        console.log("kakaoRouter에서 req.user >>>>>", req.user);
        const userInfo = req.user;
        const userId = req.user.userId; // 사용자 ID를 가져옴

        // 클라이언트는 새로운 페이지로 이동하면서 새로운 헤더를 받지 않는다.
        res.redirect("https://omo-six.vercel.app/"); // 리다이렉션
      } else {
        res.status(401).json({ message: "카카오 로그인 실패" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "서버 에러" });
    }
  },
);

// 토큰을 반환하는 엔드포인트
router.get("/getToken", getUserInfo, async (req, res) => {
  const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
  const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

  // 사용자 정보가 없으면 인증되지 않은 사용자로 처리
  if (!req.userInfo || !req.userInfo.userId) {
    return res.status(401).json({ message: "인증되지 않은 사용자" });
  }

  console.log(req.userInfo);

  const userId = req.userInfo.userId;
  console.log("userId >>>", userId);

  // 엑세스 토큰 생성
  const accessToken = jwt.sign({ userId }, accessKey, {
    expiresIn: "2h",
  });

  // Refresh Token을 데이터베이스에 저장
  const refreshToken = jwt.sign({ userId }, refreshKey, {
    expiresIn: "7d",
  });

  const sevenDaysLater = new Date(); // 현재 시간
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  await prisma.refreshTokens.create({
    data: {
      refreshToken: refreshToken,
      UserId: +userId,
      expiresAt: sevenDaysLater,
    },
  });

  res.setHeader("Authorization", `Bearer ${accessToken}`);
  res.setHeader("RefreshToken", `Bearer ${refreshToken}`);
  res.send("토큰 발급 성공");
});

export default router;
