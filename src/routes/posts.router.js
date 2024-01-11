import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/auth.middleware.js";
import { fileFilter } from "../utils/putImageS3.js";
import { prisma } from "../utils/prisma/index.js";
import { PostsRepository } from "../repositories/posts.repository.js";
import { PostsService } from "../services/posts.service.js";
import { PostsController } from "../controllers/posts.controller.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter });

const postsRepository = new PostsRepository(prisma);
const postsService = new PostsService(postsRepository);
const postsController = new PostsController(postsService);

/** 게시글 목록 조회 **/
router.get("/posts", postsController.getPosts);
/** 게시글 상세 조회 **/
router.get("/posts/:postId", postsController.getPostById);
/** 게시글 작성 **/
router.post(
  "/posts",
  authMiddleware,
  upload.array("imgUrl", 5),
  postsController.createPost,
);
/** 게시글 수정 **/
router.patch("/posts/:postId", authMiddleware, postsController.updatePost);
/** 게시글 삭제 **/
router.delete("/posts/:postId", authMiddleware, postsController.deletePost);

export default router;
