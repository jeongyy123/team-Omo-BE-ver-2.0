import express from "express";
import { prisma } from '../utils/prisma/index.js';
import { SearchingRepository } from "../repositories/searching.repository.js";
import { SearchingService } from "../services/searching.service.js";
import { SearchingController } from '../controllers/searching.controller.js'

const router = express.Router();

const searchingRepository = new SearchingRepository(prisma);
const searchingService = new SearchingService(searchingRepository);
const searchingController = new SearchingController(searchingService);

/* 검색 기능 (유저, 가게 이름) */
router.get("/posts/main/searching", searchingController.getSearching)

export default router;