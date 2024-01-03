import express from "express";
import { SearchingController } from '../controllers/searching.controller.js'

const router = express.Router();

const searchingController = new SearchingController();

/* 검색 기능 (유저, 가게 이름) */
router.get("/posts/main/searching", searchingController.getSearching)

export default router;