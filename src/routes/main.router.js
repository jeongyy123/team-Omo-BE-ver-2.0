import express from "express";
import { MainController } from '../controllers/main.controller.js'

const router = express.Router();

const mainController = new MainController();
/* 인기글 조회 */
router.get("/main/popular", mainController.getPoplurPosts);
/* 최신글 조회 */
router.get("/main/recent", mainController.getRecentPosts);
/* 댓글 조회 */
router.get("/main/comments", mainController.getRecentComments);

export default router;