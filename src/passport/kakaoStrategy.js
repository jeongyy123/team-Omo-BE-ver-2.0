import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { prisma } from "../utils/prisma/index.js";
import dotenv from "dotenv";
dotenv.config();

// 사용자가 카카오를 통해 로그인하면 실행될 전략과 그에 따른 처리를 정의
const kakaoAuthConfig = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        clientSecret: process.env.SECRET_KEY, // 클라이언트 시크릿 설정
        callbackURL: "https://mohaji.site/auth/kakao/callback", // 카카오 로그인 후 카카오가 결과를 전송해줄 URL
        scope: ["profile_nickname", "profile_image", "account_email"],
      },

      async (accessToken, refreshToken, profile, done) => {

        // 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입

        try {
          // DB에서 가입이력 조사
          const exUser = await prisma.users.findFirst({
            // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
            where: {
              snsId: String(profile.id),
              provider: "kakao",
            },
          });

          if (exUser) {
            // 유저를 찾았을 경우
            done(null, exUser); // 이미 가입된 경우
          } else {
            // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
            const newUser = await prisma.users.create({
              data: {
                email: profile._json.kakao_account.email,
                nickname: profile.username,
                snsId: String(profile.id),
                provider: "kakao",
                imgUrl: profile._json.properties.profile_image,
                password: "",
              },
            });



            // 사용자를 생성한 후 done() 함수 호출
            done(null, newUser); // 회원가입 및 로그인 인증 완료
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
