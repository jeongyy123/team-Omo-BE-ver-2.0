import passport from "passport";
import kakaoAuthConfig from "./kakaoStrategy.js"; // 카카오 서버로 로그인할 때
import { prisma } from "../utils/prisma/index.js";

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // passport.deserializeUser(): 세션에서 저장된 정보를 토대로 사용자 객체를 만들어주는 역할을 한다.
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.users.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  kakaoAuthConfig(); // 카카오 전략 등록
};

export default configurePassport;
