import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { FollowingRepository } from "../repositories/following.repository.js";
import { FollowingService } from "../services/following.service.js";
import { FollowingController } from "../controllers/following.controller.js";

const followingRepository = new FollowingRepository(prisma);
const followingService = new FollowingService(followingRepository);
const followingController = new FollowingController(followingService);

const router = express.Router();

/* 팔로우 하기 */
router.post("/follows/:userId", authMiddleware, followingController.followUser);

/* 팔로우 취소 하기 */
router.delete("/follows/:userId", authMiddleware, followingController.unFollowUser);

/* !내가! 팔로우한 사람 보기 */
router.get("/users/followingList", authMiddleware, followingController.getFollowingList);

/* !나를! 팔로우한 사람 보기 */
router.get("/users/followerList", authMiddleware, followingController.getFollowersList);

/* !다른 사람이! !내가! 팔로우한 사람 보기 */
router.get("/users/followingList/:userId", followingController.getOtherFollowingList);

/* !다른 사람이! !나를! 팔로우한 사람 보기 */
router.get("/users/followerList/:userId", followingController.getOtherFollowersList);

export default router;
