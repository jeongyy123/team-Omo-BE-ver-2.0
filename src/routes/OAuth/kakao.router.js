import express from "express";
import passport from "passport";
import { prisma } from "../../utils/prisma/index.js";

const router = express.Router();

// 카카오로 로그인하기 라우터
router.get("/kakao", passport.authenticate("kakao"));

// 카카오 로그인 후 콜백 라우터
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    // 카카오 로그인 실패 시 리다이렉션할 경로
    failureRedirect: "/",
  }),
  // Passport에서는 사용자 정보를 req.user에 저장
  async (req, res) => {
    // 여기서 토큰 생성 및 반환 등의 로직 수행
    if (req.user) {
      // 사용자가 로그인에 성공했다면 토큰 생성
      const userId = req.user.id; // 사용자 ID를 가져옴

      // 엑세스 토큰 생성
      const accessToken = jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "2h", // 엑세스 토큰 만료 기간 설정
        },
      );

      // 리프레시 토큰 생성
      const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d", // 리프레시 토큰 만료 기간 설정
        },
      );

      const sevenDaysLater = new Date(); // 현재 시간
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장
      await prisma.refreshTokens.create({
        data: {
          refreshToken: refreshToken,
          UserId: +userId,
          expiresAt: sevenDaysLater,
        },
      });

      // 클라이언트에게 엑세스 토큰과 리프레시 토큰 응답
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.setHeader("RefreshToken", `Bearer ${refreshToken}`);

      res.status(200).json({ message: "카카오 로그인 성공" });
    } else {
      res.status(401).json({ message: "카카오 로그인 실패" });
    }
  },
);

export default router;
