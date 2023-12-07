import express from "express";
import passport from "passport";

const router = express.Router();

// 카카오로 로그인하기 라우터
router.get("/kakao", passport.authenticate("kakao"));

// 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  },
);

export default router;
