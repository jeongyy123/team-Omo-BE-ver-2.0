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
    // 성공하면 토큰을 발급해서 클라이언트에 전달해줘야 하는데 이 부분이 빠져있음.

    // 성공했다는 메시지를 전달해야하나...?
    res.redirect("/");
  },
);

export default router;
