import express from "express";
import users from "./users/user.router.js";
import profiles from "./profiles/profile.router.js";
import main from "./main/main.router.js";
import bookmark from "./bookmark/bookmark.router.js";
import isLike from "./isLike/isLike.router.js";
import posts from "./posts/posts.router.js";
import searching from "./searching/searching.router.js";

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

/**
 * @swagger
 * tags:
 *   - name: Main
 *     description: 자치구별, 카테고리별 최신글 조회/인기글 조회/댓글 조회
 */

/**
 * @swagger
 * tags:
 *   - name: Bookmark
 *     description: 북마크하기/북마크 취소/ 사용자의 북마크 지도 표시
 */

/**
 * @swagger
 * tags:
 *   - name: IsLike
 *     description: 좋아요하기/좋아요 취소/ 사용자의 좋아요한 게시글 조회
 */

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: 게시글 목록 조회/게시글 상세 조회/게시글 작성/게시글 수정/게시글 삭제
 */

/**
 * @swagger
 * tags:
 *   - name: Searching
 *     description: 유저이름/가게이름으로 검색
 */

router.use("/users", users);
router.use("/profiles", profiles);
router.use("/main", main);
router.use("/bookmark", bookmark);
router.use("/isLike", isLike);
router.use("/posts", posts);
router.use("/searching", searching);

export default router;
