import express from "express";
import users from "./users/user.router.js";
import profiles from "./profiles/profile.router.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: 회원가입/로그인/로그아웃/회원탈퇴/엑세스 토큰 재발급
 */

/**
 * @swagger
 * tags:
 *   - name: Profiles
 *     description: 프로필 조회/프로필 수정/유저의 북마크 조회/유저가 작성한 게시글의 목록 조회
 */

router.use("/users", users);
router.use("/profiles", profiles);

export default router;
