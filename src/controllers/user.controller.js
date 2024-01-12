import { UserService } from "../services/user.service.js";
import {
  registerSchema,
  loginSchema,
  nicknameSchema,
  emailSchema,
} from "../validations/auth.validation.js";

export class UserController {
  userService = new UserService(); // userService 객체

  /** 이메일 인증 요청 */
  sendEmailVerification = async (req, res, next) => {
    try {
      const validation = await emailSchema.validateAsync(req.body);
      const { email } = validation;

      const result = await this.userService.sendEmailVerification(email);

      result.transporter.sendMail(result.mailOptions, (err, info) => {

        //첫번째 인자는 위에서 설정한 mailOption을 넣어주고 두번째 인자로는 콜백함수.
        if (err) {

          res
            .status(500)
            .json({ ok: false, msg: "메일 전송에 실패하였습니다." });
        } else {

          res
            .status(200)
            .json({ ok: true, msg: "메일 전송에 성공하였습니다." });
        }
      });
    } catch (err) {
      next(err);
    }
  };

  /** 이메일 인증번호 검증 */
  checkEmailVerification = async (req, res, next) => {
    try {
      const { authenticationCode, email } = req.body;

      await this.userService.checkEmailVerification(authenticationCode, email);

      return res
        .status(200)
        .json({ message: "인증번호가 성공적으로 확인되었습니다." });
    } catch (err) {
      next(err);
    }
  };

  /** 중복된 닉네임을 확인 */
  checkDuplicateNickname = async (req, res, next) => {
    try {
      const validation = await nicknameSchema.validateAsync(req.body);
      const { nickname } = validation;

      await this.userService.checkDuplicateNickname(nickname);

      return res.status(200).json({ message: "중복검사 완료" });
    } catch (err) {
      next(err);
    }
  };

  /** 회원가입 */
  registerUser = async (req, res, next) => {
    try {
      const validation = await registerSchema.validateAsync(req.body);
      const { nickname, email, password, confirmedPassword } = validation;

      await this.userService.registerUser(
        nickname,
        email,
        password,
        confirmedPassword,
      );

      return res.status(201).json({ message: "회원가입이 완료되었습니다." });
    } catch (err) {
      next(err);
    }
  };

  /** 로그인 */
  loginUser = async (req, res, next) => {
    try {
      const validation = await loginSchema.validateAsync(req.body);
      const { email, password } = validation;

      const foundUser = await this.userService.loginUser(email, password);

      // 응답 헤더로 전달
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Authorization, RefreshToken",
      );
      res.setHeader("Authorization", `Bearer ${foundUser.accessToken}`);
      res.setHeader("RefreshToken", `Bearer ${foundUser.refreshToken}`);

      return res.status(200).json({ userId: foundUser.userId });
    } catch (err) {
      next(err);
    }
  };

  /** 리프레시 토큰을 이용해서 엑세스 토큰을 재발급 */
  renewAccessAndRefreshTokens = async (req, res, next) => {
    try {
      const { refreshtoken } = req.headers;

      const result =
        await this.userService.renewAccessAndRefreshTokens(refreshtoken);

      res.setHeader(
        "Access-Control-Expose-Headers",
        "Authorization, RefreshToken",
      );
      res.setHeader("Authorization", `Bearer ${result.newAccessToken}`);
      res.setHeader("RefreshToken", `Bearer ${result.newRefreshToken}`);

      return res.status(200).json({ userId: result.userId });
    } catch (err) {
      next(err);
    }
  };

  /** 로그아웃 */
  logoutUser = async (req, res, next) => {
    try {
      const { userId } = req.user;

      await this.userService.logoutUser(userId);

      return res.status(200).json({ message: "로그아웃 되었습니다." });
    } catch (err) {
      next(err);
    }
  };

  /** 회원탈퇴 */
  deleteAccount = async (req, res, next) => {
    try {
      const { userId } = req.user;

      await this.userService.deleteAccount(userId);

      return res.status(200).json({
        message:
          "회원탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.",
      });
    } catch (err) {
      next(err);
    }
  };
}
