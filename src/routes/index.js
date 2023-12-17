import express from "express";
import users from "./users/user.router.js";
import profiles from "./profiles/profile.router.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User registration/login/logout/account deletion/access token reissue
 */

/**
 * @swagger
 * tags:
 *   - name: Profiles
 *     description: Profile viewing/profile information modification/bookmark viewing/posts authored by user
 */

router.use("/users", users);
router.use("/profiles", profiles);

export default router;
