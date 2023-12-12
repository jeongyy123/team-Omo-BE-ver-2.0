import passport from "passport";
import kakaoAuthConfig from "./kakaoStrategy.js"; // 카카오 서버로 로그인할 때
import { prisma } from "../utils/prisma/index.js";

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.users.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  kakaoAuthConfig();
};

export default configurePassport;
