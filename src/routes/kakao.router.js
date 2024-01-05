import express from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth.controller.js";

const router = express.Router();

const authController = new AuthController(); // AuthController를 인스턴스화 시킨다

// 로그인 라우터
//router.get("/kakao", passport.authenticate("kakao", { session: false }));

// 로그인 후 콜백 라우터
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false, // 세션 비활성화
    failureRedirect: "https://omo-six.vercel.app/login",
  }),
  // Passport에서는 사용자 정보를 req.user에 저장
  async (req, res) => {
    try {
      const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
      const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

      if (req.user) {
        // 사용자 정보는 req.user에 저장
        console.log("kakaoRouter에서 req.user >>>>>", req.user);
        const userInfo = req.user;
        const userId = req.user.userId; // 사용자 ID를 가져옴

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

        res.redirect(
          `https://omo-six.vercel.app/?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${userId}`,
        );
      } else {
        res.status(401).json({ message: "카카오 로그인 실패" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "서버 에러" });
    }
  },
);

// 로그인 라우터
// router.get("/kakao", passport.authenticate("kakao", { session: false }));

// 로그인 후 콜백 라우터
// router.get("/kakao/callback", authController.kakaoCallback);

export default router;
