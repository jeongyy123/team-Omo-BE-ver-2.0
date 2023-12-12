import passport from "passport";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { prisma } from "../utils/prisma/index.js";

/**
 * Passport는 웹 애플리케이션에서 인증을 처리하기 위한 "미들웨어"로,
 * 다양한 인증 전략(strategy)을 제공하여 사용자 인증을 용이하게 구현할 수 있도록 도와줍니다.
 */

// Strategy => 인증방식이라고 생각하면 쉽다.
/**
 * 카카오 전략(Kakao Strategy)은 Passport.js에서 카카오 OAuth 인증을 위한 전략으로,
 * 사용자가 카카오 계정으로 로그인할 수 있게 해주는 모듈입니다.
 * 이를 통해 애플리케이션에서 카카오 계정을 통한 사용자 인증 및 로그인을 처리할 수 있습니다.
 */

// Passport.js에서 다양한 인증 방식(strategy)을 사용할 수 있으며,
// passport.use()를 통해 각각의 전략(strategy)을 등록하고 설정할 수 있습니다.
// 다양한 인증 방식을 passport.use()를 통해 설정하고 등록할 수 있습니다.
// 이를 통해 Passport는 요청을 처리하면서 설정된 인증 방식을 활용하여 사용자를 인증하고 처리할 수 있도록 도와줍니다.
const kakaoAuthConfig = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
        callbackURL: "/auth/kakao/callback",
      },
      /*
       * clientID에 카카오 앱 아이디 추가
       * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
       * accessToken, refreshToken: 로그인 성공 후 카카오가 보내준 토큰
       * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
       */
      async (accessToken, refreshToken, profile, done) => {
        console.log("kakao profile", profile);
        try {
          // DB에서 가입이력 조사
          const exUser = await prisma.users.findUnique({
            /**
             * 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
             * 기존에 카카오를 통해 회원가입한 사용자가 있는지를 profile.id로 조회한다.
             * 있다면 이미 회원가입이 되어 있는 경우이므로 사용자 정보와 함께 done 함수를 호출하고 전략을 종료한다.
             */
            where: { snsId: profile.id, provider: "kakao" },
          });

          // 이미 가입된 카카오 프로필이면 성공
          if (exUser) {
            done(null, exUser); // 로그인 인증 완료
          } else {
            /**
             * 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
             * 만일 카카오를 통해 회원가입한 사용자가 없다면 해당 사용자의 회원가입을 자동으로 진행한다
             * 카카오에서는 인증 후 callbackURL에 적힌 주소로 accessToken, refreshToken과 profile을 보내는데,
             * profile에는 사용자 정보들이 들어있다.
             * 이후 원하는 정보들을 profile 객체에서 꺼내와 회원가입을 진행하면 된다.
             * 사용자를 생성한 뒤 done 함수를 호출하게 된다
             */
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
