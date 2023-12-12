import passport from "passport";
import kakaoAuthConfig from "./kakaoStrategy.js"; // 카카오 서버로 로그인할 때
import { prisma } from "../utils/prisma/index.js";

const configurePassport = () => {
  // passport.serializeUser(): 메서드는 사용자 객체를 전달받아서 해당 사용자의 ID를 세션에 저장합니다.
  // serializeUser() 메서드의 콜백 함수는 첫 번째 파라미터로 user 객체를 받고,
  // 두 번째 파라미터로는 done 콜백 함수가 제공됩니다.
  // 여기서 user.id를 사용하여 사용자의 식별자(ID)를 세션에 저장하도록 정의되어 있습니다
  // done() 콜백 함수의 첫 번째 파라미터는 일반적으로 에러를 나타내며, 두 번째 파라미터는 세션에 저장할 값입니다.
  // 이 경우 user.id가 해당 값으로 사용됩니다.
  // 이렇게 설정된 serializeUser() 메서드는 사용자가 로그인하면 해당 사용자의 ID를 세션에 저장하여 나중에 요청 시에
  // 세션에서 사용자를 식별할 수 있도록 합니다. 그리고 이 정보를 기반으로 deserializeUser() 메서드를 통해
  // 사용자 객체를 복원하고 인증합니다.
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

  kakaoAuthConfig(); // kakaoStrategy.js에 구현된 카카오 전략을 Passport에 등록
  // kakaoAuthConfig() 함수가 호출되어서 카카오 전략이 Passport에 등록되고,
  // 사용자가 카카오를 통해 로그인하는 인증 과정을 수행할 수 있도록 설정
};

export default configurePassport;
