import passport from "passport";
import kakaoAuthConfig from "./kakaoStrategy.js"; // 카카오 서버로 로그인할 때
// import { prisma } from "../utils/prisma/index.js";

// kakaoStrategy.js를 passport에 등록한다
const configurePassport = () => {
  // passport.serializeUser((user, done) => {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(async (id, done) => {
  //   try {
  //     const user = await prisma.users.findUnique({ where: { id } });
  //     done(null, user);
  //   } catch (error) {
  //     done(error);
  //   }
  // });

  kakaoAuthConfig(); // 카카오 전략 등록
};

export default configurePassport;
