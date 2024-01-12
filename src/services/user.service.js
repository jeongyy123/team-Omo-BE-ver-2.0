import { UserRepository } from "../repositories/user.repository.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

// 랜덤한 숫자 생성 함수
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class UserService {
  userRepository = new UserRepository();

  /** 이메일 인증 요청 */
  sendEmailVerification = async (email) => {
    const sender = process.env.EMAIL_SENDER;

    // 인증번호를 보내기 전에 이메일 중복을 체크하여 이미 가입된 이메일인 경우에는 인증 이메일을 보내지 않는다
    const existEmail = await this.userRepository.existEmail(email);

    if (existEmail) {
      const err = new Error("중복된 이메일입니다.");
      err.statusCode = 409;
      throw err;
    }

    // 인증번호 생성
    // 원하는 범위 내에서 랜덤한 숫자 생성 (예: 111111부터 999999까지)
    const randomNumber = generateRandomNumber(111111, 999999);

    // 인증 이메일을 보낸 후 인증번호를 데이터베이스에 저장
    await this.userRepository.saveVerificationCode(email, randomNumber);

    // 만료시간 이후에 삭제가 되어야함.
    // 인증번호를 확인하는 메소드에서 삭제요청 들어감

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: "OMO <sender>", // 발신자 이메일 주소
      to: email, // 사용자가 입력한 이메일
      subject: "OMO에서 온 인증 관련 메일입니다 ✔", // Subject line
      text: `인증 코드 : ${randomNumber}를 입력해주세요.`, // plain text body
      html: `
      <h1 style="color: black;">안녕하세요, <span style="font-family: 'Pacifico', cursive; font-size: 48px; font-weight: bold; color:#FFB6C1; letter-spacing: 5px;">OMO</span>에서 온 인증 관련 메일입니다!</h1>
      <p>아래 인증 코드를 사용하여 계정을 확인해주세요:</p>
      <div style="background-color: #FFF0F5; padding: 15px; border-radius: 5px; text-align: center;">
      <img src="https://i.ibb.co/yPWZ4W9/your-image.png" alt="이미지" style="width: 50px; height: 50px;">
          <h2 style="margin-bottom: 10px;">인증 코드</h2>
          <p style="font-size: 24px; margin-bottom: 0; padding: 10px 15px; background-color: #fff; border-radius: 3px; border: 2px solid #ccc; display: inline-block;"><strong>${randomNumber}</strong></p>
      </div>
      <p style="margin-top: 20px;">위의 코드를 입력하여 계정을 확인해주세요.</p>
      <p>감사합니다.</p>
  `,
    };

    return { mailOptions, transporter };
  };

  /** 이메일 인증번호 검증 */
  checkEmailVerification = async (authenticationCode, email) => {
    // 이미 만료기간이 지난 인증번호를 db에서 삭제
    const expiredVerificationCodes =
      await this.userRepository.findExpiredVerificationCodes();

    // 만료된 인증번호를 삭제.
    for (const code of expiredVerificationCodes) {
      await this.userRepository.deleteUsedVerificationCode(code);
    }

    // 인증번호가 일치하는지 확인
    const checkVerificationCode =
      await this.userRepository.checkVerificationCode(
        authenticationCode,
        email,
      );

    // 클라이언트가 인증 정보를 제공하지 않으면
    if (!checkVerificationCode) {
      const err = new Error("인증번호가 일치하지 않습니다.");
      err.statusCode = 404;
      throw err;
    }

    // 인증번호가 일치하는 경우에만 삭제
    await this.userRepository.deleteUsedVerificationCode(checkVerificationCode);

    return { message: "인증번호가 성공적으로 확인되었습니다." };
  };

  /** 중복된 닉네임을 확인 */
  checkDuplicateNickname = async (nickname) => {
    const existNickname = await this.userRepository.existNickname(nickname);

    if (existNickname) {
      const err = new Error(
        "이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.",
      );
      err.statusCode = 409;
      throw err;
    }

    return { message: "중복검사 완료" };
  };

  /** 회원가입 */
  registerUser = async (nickname, email, password, confirmedPassword) => {
    //
    if (password !== confirmedPassword) {
      const err = new Error("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      err.statusCode = 400;
      throw err;
    }

    const saltRound = 10;
    const encryptPassword = await bcrypt.hash(password, saltRound);

    const defaultImageUrl =
      "0b2f746651bb7e903bd2c985714170b8746f0fc6d9a966ba31476e515495ebd1";

    await this.userRepository.createUser(
      email,
      encryptPassword,
      nickname,
      defaultImageUrl,
    );

    return { message: "회원가입이 완료되었습니다." };
  };

  /** 로그인 */
  loginUser = async (email, password) => {
    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    const findUser = await this.userRepository.findUser(email);

    if (!findUser) {
      const err = new Error("해당 이메일로 가입된 내역이 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    const isMatch = bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      const err = new Error("비밀번호가 틀립니다. 다시 한 번 확인해 주세요.");
      err.statusCode = 401;
      throw err;
    }

    // Issue access token
    const accessToken = jwt.sign(
      {
        purpose: "access",
        userId: findUser.userId,
      },
      accessKey,
      { expiresIn: "2h" },
    );

    // Issue refresh token
    const refreshToken = jwt.sign(
      {
        purpose: "refresh",
        userId: findUser.userId,
      },
      refreshKey,
      { expiresIn: "7d" },
    );

    const sevenDaysLater = new Date(); // 현재 시간
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const foundUserId = findUser.userId;

    await this.userRepository.saveRefreshToken(
      refreshToken,
      foundUserId,
      sevenDaysLater,
    );

    return { userId: findUser.userId, accessToken, refreshToken };
  };

  /** 리프레시 토큰을 이용해서 엑세스 토큰을 재발급 */
  renewAccessAndRefreshTokens = async (refreshtoken) => {
    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    const [tokenType, token] = refreshtoken.split(" ");

    if (!token) {
      const err = new Error("토큰이 존재하지 않습니다.");
      err.statusCode = 400;
      throw err;
    }

    if (tokenType !== "Bearer") {
      const err = new Error("Bearer형식이 아닙니다.");
      err.statusCode = 400;
      throw err;
    }

    const decodedToken = jwt.verify(token, refreshKey);

    if (!decodedToken) {
      const err = new Error("리프레시 토큰이 유효하지 않습니다.");
      err.statusCode = 401;
      throw err;
    }

    const { userId } = decodedToken;

    // 데이터베이스에서 유효한 리프레시 토큰인지 확인
    const isRefreshTokenExist = await this.userRepository.isRefreshTokenExist(
      token,
      userId,
    );

    if (!isRefreshTokenExist) {
      const err = new Error("토큰이 존재하지 않습니다.");
      err.statusCode = 401;
      throw err;
    }

    const tokenId = isRefreshTokenExist.tokenId;

    // 새로운 엑세스 토큰을 발급하기 전에 이전 리프레시 토큰을 데이터베이스에서 삭제
    await this.userRepository.deletePreviousRefreshToken(token, tokenId);

    const newAccessToken = jwt.sign(
      {
        purpose: "newaccess",
        userId: userId,
      },
      accessKey,
      { expiresIn: "2h" },
    );

    const newRefreshToken = jwt.sign(
      {
        purpose: "newrefresh",
        userId: userId,
      },
      refreshKey,
      { expiresIn: "7d" },
    );

    const sevenDaysLater = new Date(); // 현재 시간
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // 리프레시 토큰을 생성하고 이를 데이터베이스에 저장한다
    await this.userRepository.saveRefreshToken(
      newRefreshToken,
      userId,
      sevenDaysLater,
    );

    return { userId, newAccessToken, newRefreshToken };
  };

  /** 로그아웃 */
  logoutUser = async (userId) => {
    const findTokenId = await this.userRepository.findTokenId(userId);

    if (!findTokenId) {
      // 해당하는 토큰을 찾지 못한 경우 예외 처리
      const err = new Error("해당하는 토큰을 찾을 수 없습니다.");
      err.statusCode = 401;
      throw err;
    }

    await this.userRepository.userLogout(userId, findTokenId);

    return {
      message: "로그아웃 되었습니다.",
    };
  };

  /** 회원탈퇴 */
  deleteAccount = async (userId) => {
    // ( 추가 ) 유저가 좋아요한 장소의 postCount를 업데이트
    await this.userRepository.updateUserPostsCounts(userId);
    // 유저가 좋아요한 게시물의 likeCount를 업데이트
    await this.userRepository.updateUserLikeCounts(userId);
    // 유저가 작성한 댓글의 갯수 업데이트
    await this.userRepository.updateUserCommentCounts(userId);
    // 유저가 작성한 대댓글의 갯수 업데이트
    await this.userRepository.updateUserReplyCounts(userId);
    // 유저 정보와 관련된 데이터 삭제
    await this.userRepository.deleteUserData(userId);

    return {
      message:
        "회원탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.",
    };
  };
}
