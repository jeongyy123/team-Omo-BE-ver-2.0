import passport from "passport";
import kakaoAuthConfig from "./kakaoStrategy.js"; // 카카오 서버로 로그인할 때

const configurePassport = () => {
  kakaoAuthConfig(); // 카카오 전략 등록
};

export default configurePassport;
