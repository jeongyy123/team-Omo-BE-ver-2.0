import express from "express";
import users from "../swagger/user.js";
import profiles from "../swagger/profile.js";
import kakao from "../swagger/kakao.js";
import main from "../swagger/main.js";
import bookmark from "../swagger/bookmark.js";
import isLike from "../swagger/isLike.js";
import posts from "../swagger/posts.js";
import searching from "../swagger/searching.js";
import location from "./swagger/location.js";
import comment from "./swagger/comment.js";
import replies from "./swagger/replies.js";
import following from "./swagger/following.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: 이메일 인증 요청/인증코드 확인/닉네임 중복확인/회원가입/로그인/로그아웃/회원탈퇴/엑세스 토큰 재발급/Kakao OAuth 로그인/Kakao OAuth 로그인 후 콜백 엔드포인트
 */

/**
 * @swagger
 * tags:
 *   - name: OAuth (kakao)
 *     description: Kakao OAuth 로그인/Kakao OAuth 로그인 후 콜백 엔드포인트
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

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: 프로필 조회/프로필 수정/유저의 북마크 조회/유저가 작성한 게시글의 목록 조회
 */
/**
 * @swagger
 * tags:
 *   - name: Comment
 *     description: 댓글 등록/조회/삭제
 */
/**
 * @swagger
 * tags:
 *   - name: replies
 *     description: 대댓글 등록/조회/삭제
 */
/**
 * @swagger
 * tags:
 *   - name: following
 *     description: 팔로우 하기/팔로우 취소/팔로워 목록 조회/팔로잉 목록 조회
 */

router.use("/users", users);
router.use("/kakao", kakao);
router.use("/profiles", profiles);
router.use("/main", main);
router.use("/bookmark", bookmark);
router.use("/isLike", isLike);
router.use("/posts", posts);
router.use("/searching", searching);
router.use("/location", location);
router.use("/comment", comment);
router.use("/replies", replies);
router.use("/following", following);

export default router;
