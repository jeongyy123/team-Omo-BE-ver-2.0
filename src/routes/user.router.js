import { UserController } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import express from "express";

const router = express.Router();

const userController = new UserController(); // UserController를 인스턴스화 시킨다

/** 이메일 인증 요청 API */
router.post("/verify-email", userController.sendEmailVerification);

/** 이메일 인증번호 검증 API */
router.post(
  "/verify-authentication-code",
  userController.checkEmailVerification,
);

/** 중복된 닉네임을 확인하는 API */
router.post("/check-nickname", userController.checkDuplicateNickname);

/** 회원가입 API */
router.post("/register", userController.registerUser);

/** 로그인 API */
router.post("/login", userController.loginUser);

/** 리프레시 토큰을 이용해서 엑세스 토큰과 리프레시 토큰을 재발급하는 API */
router.post("/tokens/refresh", userController.renewAccessAndRefreshTokens);

/** 로그아웃 API */
router.post("/logout", authMiddleware, userController.logoutUser);

/** 회원탈퇴 API */
router.delete("/withdraw", authMiddleware, userController.deleteAccount);

export default router;
