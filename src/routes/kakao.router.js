import express from "express";
import { AuthController } from "../controllers/auth.controller.js";
import passport from "passport";

const router = express.Router();

const authController = new AuthController(); // AuthController를 인스턴스화 시킨다

// 로그인 라우터
router.get("/kakao", authController.kakaoLogin);

// 로그인 후 콜백 라우터
router.get("/kakao/callback", passport.authenticate(
    "kakao",
    {
      session: false, // 세션 비활성화
      failureRedirect: "https://omo-six.vercel.app/login",
    }), authController.kakaoCallback);

export default router;
