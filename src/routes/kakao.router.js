import express from "express";
import { AuthController } from "../controllers/auth.controller.js";

const router = express.Router();

const authController = new AuthController(); // AuthController를 인스턴스화 시킨다

// 로그인 라우터
router.get("/kakao", authController.kakaoLogin);

// 로그인 후 콜백 라우터
router.get("/kakao/callback", authController.kakaoCallback);

export default router;
