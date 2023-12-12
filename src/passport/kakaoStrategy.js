import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { prisma } from "../utils/prisma/index.js";

const kakaoAuthConfig = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        callbackURL: "/auth/kakao/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          // DB에서 가입이력 조사
          const exUser = await prisma.users.findUnique({
            where: { snsId: profile.id, provider: "kakao" },
          });

          // 이미 가입된 카카오 프로필이면 성공
          if (exUser) {
            done(null, exUser); // 로그인 인증 완료
          } else {
            const newUser = await prisma.users.create({
              email: profile._json && profile._json.kakao_account_email,
              nickname: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });

            done(null, newUser); // 회원가입하고 로그인 인증 완료
          }
        } catch (error) {
          // 로그인 실패
          console.error(error);
          done(error);
        }
      },
    ),
  );
};

export default kakaoAuthConfig;
