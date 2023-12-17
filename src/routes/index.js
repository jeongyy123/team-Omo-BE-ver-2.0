import express from "express";
import users from "./users/user.router.js";
import profiles from "./profiles/profile.router.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User-related operations
 */

/**
 * @swagger
 * tags:
 *   - name: Profiles
 *     description: Profile-related operations
 */

router.use("/users/user.router", users);
router.use("/profiles/profile.router", profiles);

export default router;
