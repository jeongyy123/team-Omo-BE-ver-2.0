import express from "express";
import { prisma } from '../utils/prisma/index.js'
import { MainRepository } from "../repositories/main.repository.js";
import { MainService } from "../services/main.service.js";
import { MainController } from '../controllers/main.controller.js'

const router = express.Router();

const mainRepository = new MainRepository(prisma);
const mainService = new MainService(mainRepository);
const mainController = new MainController(mainService);
/* 인기글 조회 */
router.get("/main/popular", mainController.getPoplurPosts);
/* 최신글 조회 */
router.get("/main/recent", mainController.getRecentPosts);
/* 댓글 조회 */
router.get("/main/comments", mainController.getRecentComments);

export default router;