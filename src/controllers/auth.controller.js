import { AuthService } from "../services/auth.service.js";
import passport from "passport";

export class AuthController {
  authService = new AuthService();

  // 로그인
  //  Passport에서 제공하는 미들웨어를 kakaoLogin 핸들러에 할당
  kakaoLogin = passport.authenticate("kakao", {
    session: false,
  });

  // 로그인 후 콜백
  // 카카오 로그인 후 콜백을 처리하는데 사용되는 미들웨어를 kakaoCallback 핸들러에 할당
  kakaoCallback = passport.authenticate(
    "kakao",
    {
      session: false, // 세션 비활성화
      failureRedirect: "https://omo-six.vercel.app/login",
    },
    async (req, res, next) => {
      // Passport에서는 사용자 정보를 req.user에 저장
      try {
        if (req.user) {
          // const userInfo = req.user;
          const result = await this.authService.handleKakaoCallback(req.user);
          const { accessToken, refreshToken, userId } = result;

          // 사용자 정보와 토큰을 발급받은 경우, 카카오 소셜 로그인 후에 새로운 URL로 리다이렉트
          res.redirect(
            `https://omo-six.vercel.app/?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${userId}`,
          );
        } else {
          return res.status(401).json({ errorMessage: "카카오 로그인 실패" });
        }
      } catch (err) {
        next(err);
      }
    },
  );
}
