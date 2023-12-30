import express from "express";
import passport from "passport";
import { prisma } from "../../utils/prisma/index.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// 카카오로 로그인하기 라우터
router.get("/kakao", passport.authenticate("kakao", { session: false }));
// router.get("/kakao", passport.authenticate("kakao"));

// 카카오 로그인 후 콜백 라우터
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 비활성화
    // 카카오 로그인 실패 시 리다이렉션할 경로
    failureRedirect: "/kakao",
  }),
  // Passport에서는 사용자 정보를 req.user에 저장
  async (req, res) => {
    try {
      const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
      const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

      // 여기서 토큰 생성 및 반환 등의 로직 수행
      if (req.user) {
        console.log("kakaoRouter에서 req.user >>>>>", req.user);
        // 사용자가 로그인에 성공했다면 토큰 생성
        const userId = req.user.userId; // 사용자 ID를 가져옴

        console.log("kakaoRouter에서 userId >>>>>>", userId);

        // 엑세스 토큰 생성
        const accessToken = jwt.sign({ userId }, accessKey, {
          expiresIn: "2h", // 엑세스 토큰 만료 기간 설정
        });

        // Refresh Token을 데이터베이스에 저장
        const refreshToken = jwt.sign({ userId }, refreshKey, {
          expiresIn: "7d", // 리프레시 토큰 만료 기간 설정
        });

        const sevenDaysLater = new Date(); // 현재 시간
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        // Refresh Token을 데이터베이스에 저장
        await prisma.refreshTokens.create({
          data: {
            refreshToken: refreshToken,
            UserId: +userId,
            expiresAt: sevenDaysLater,
          },
        });

        // 클라이언트에게 엑세스 토큰과 리프레시 토큰을 응답
        res.status(200).json({
          accessToken,
          refreshToken,
          message: "카카오 로그인 성공",
          // redirectUrl: "/main", // 리다이렉션할 URL을 응답에 포함
        });

        //
      } else {
        res.status(401).json({ message: "카카오 로그인 실패" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "서버 에러" });
    }
  },
);

export default router;
