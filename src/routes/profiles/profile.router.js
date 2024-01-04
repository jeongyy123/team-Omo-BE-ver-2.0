import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import multer from "multer";
import { fileFilter } from "../../utils/putImageS3.js";
import { ProfileController } from "../../controllers/profile.controller.js";

// 매모리 저장 객체 생성
const storage = multer.memoryStorage();
// multer로 업로드 기능을 생성. 항상 이미지를 메모리에 저장하도록 하기 위함이다.
const upload = multer({ storage: storage, fileFilter });

const router = express.Router();
const profileController = new ProfileController(); // ProfileController를 인스턴스화 시킨다.

/** 마이페이지 회원정보 조회 */
router.get("/users/self/profile", authMiddleware, profileController.getProfile);

/** 마이페이지 게시글 목록 조회 */
router.get(
  "/users/self/profile/posts",
  authMiddleware,
  profileController.getMyPosts,
);

/** 마이페이지 북마크 목록 조회 */
router.get(
  "/users/self/profile/bookmark",
  authMiddleware,
  profileController.getMyBookmarks,
);

/** 마이페이지 내 정보 수정 */
router.patch(
  "/users/self/profile/edit",
  upload.single("imgUrl"),
  authMiddleware,
  profileController.editMyInfo,
);

/** 다른 유저의 프로필 조회 */
router.get(
  "/users/profile/:nickname",
  authMiddleware,
  profileController.viewOtherProfile,
);

/** 다른 유저의 프로필에서 그 사람이 쓴 게시글 목록 조회 */
router.get(
  "/users/profile/:nickname/posts",
  profileController.viewPostsFromOtherProfile,
);

export default router;
