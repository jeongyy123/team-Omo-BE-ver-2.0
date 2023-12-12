import express from "express";
import passport from "passport";

const router = express.Router();

// 카카오로 로그인하기 라우터
// '/kakao/로 요청오면, 카카오 로그인 페이지로 가게 되고, 카카오 서버를 통해 카카오 로그인을 하게 되면, 다음 라우터로 요청한다.
router.get("/kakao", passport.authenticate("kakao"));

// 위에서 카카오 서버 로그인이 되면, 카카오 redirect url 설정에 따라 이쪽 라우터로 오게 된다.
router.get(
  "/kakao/callback",
  // 카카오 인증 전략 시행 => kakaoStrategy.js로 감
  passport.authenticate("kakao", {
    failureRedirect: "/", // kakaoStrategy에서 실패한다면 실행, 즉 로그인 실패하면 실행
  }),
  // kakaoStrategy에서 성공한다면 콜백 실행
  (req, res) => {
    res.redirect("/");
  },
);

export default router;

// 1. GET /auth/kakao에서 로그인 전략을 수행하는데, 이 때 카카오 로그인 창으로 리다이렉트한다.
// 2. 그리고 로그인 창에서 사용자가 ID/PW를 쳐서 로그인하면, 성공 여부 결과를 GET /auth/kakao/callback으로 받게된다.
// 3. 그리고 kakao/callback 라우터에서는 카카오 로그인 전략을 다시 수행한다.

// 카카오 로그인은 로그인 성공 시 내부적으로 req.login을 호출하므로, 우리가 직접 호출할 필요가 없다.

// 콜백 함수 대신 로그인에 실패했을 때 어디로 이동할지를 failureRedirect 속성에 적어준다.

// 성공했을 때에도 어디로 이동할지를 미들웨어에 적어준다.
