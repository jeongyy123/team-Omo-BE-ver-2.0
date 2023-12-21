import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import authMiddleware from "../../middlewares/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  nicknameSchema,
  emailSchema,
} from "../../validations/auth.validation.js";

dotenv.config();
const router = express.Router();

/**
 * @swagger
 * paths:
 *  /auth/verify-email:
 *    post:
 *     summary: 이메일 인증 요청
 *     description: 회원가입할 때 이메일 인증을 요청하면 인증 이메일이 해당 이메일 주소로 전송한다
 *     tags:
 *       - Users
 *     responses:
 *      '200':
 *        description: 이메일 유효성 검증 후 해당 이메일로 인증번호를 성공적으로 전송한 경우
 *        content:
 *         applicaiton/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: 메일 전송에 성공하였습니다.
 *      '409':
 *        description: 입력한 이메일이 이미 존재하는 경우
 *        content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errorMessage:
 *                 type: string
 *                 example: 중복된 이메일입니다.
 *      '500':
 *        description: 이메일 전송에 실패한 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 메일 전송에 실패하였습니다..
 */

// 랜덤한 숫자 생성 함수
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 이메일 인증 요청 API
router.post("/verify-email", async (req, res, next) => {
  try {
    const validation = await emailSchema.validateAsync(req.body);
    const { email } = validation; // 사용자가 입력한 이메일
    const sender = process.env.EMAIL_SENDER;

    // 인증번호를 보내기 전에 이메일 중복을 체크하여 이미 가입된 이메일인 경우에는 인증 이메일을 보내지 않는다
    const existEmail = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (existEmail) {
      return res.status(409).json({ errorMessage: "중복된 이메일입니다." });
    }

    // 인증번호 생성
    // 원하는 범위 내에서 랜덤한 숫자 생성 (예: 111111부터 999999까지)
    const randomNumber = generateRandomNumber(111111, 999999);
    console.log(typeof randomNumber); // number

    // 인증 이메일을 보낸 후 인증번호를 데이터베이스에 저장
    await prisma.verificationCode.create({
      data: {
        email: email,
        verificationCode: randomNumber,
        expiryDate: new Date(Date.now() + 10 * 60 * 1000), // 예: 10분 후 만료
      },
    });

    // 만료시간 이후에 삭제가 되야하나...?

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
              <h1 style="color: black;">안녕하세요, <span style="font-family: 'Pacifico', cursive; font-size: 48px; font-weight: bold; color: #62a4c4; letter-spacing: 5px;">OMO</span>에서 온 인증 관련 메일입니다!</h1>
              <p>아래 인증 코드를 사용하여 계정을 확인해주세요:</p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center;">
                <h2 style="margin-bottom: 10px;">인증 코드</h2>
                <p style="font-size: 24px; margin-bottom: 0; padding: 10px 15px; background-color: #fff; border-radius: 3px; border: 2px solid #ccc; display: inline-block;"><strong>${randomNumber}</strong></p>
              </div>
              <p style="margin-top: 20px;">위의 코드를 입력하여 계정을 확인해주세요.</p>
              <p>감사합니다.</p>
            `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      console.log("info", info);
      //첫번째 인자는 위에서 설정한 mailOption을 넣어주고 두번째 인자로는 콜백함수.
      if (err) {
        console.error("메일 전송에 실패하였습니다:", err);
        res.status(500).json({ ok: false, msg: "메일 전송에 실패하였습니다." });
      } else {
        console.log("인증 이메일이 전송되었습니다.", info);
        res.status(200).json({ ok: true, msg: "메일 전송에 성공하였습니다." });
      }
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /auth/verify-authentication-code:
 *   post:
 *    summary: 인증코드 확인
 *    description: 입력받은 인증 코드가 올바른지 확인한다
 *    tags:
 *      - Users
 *    responses:
 *      '200':
 *        description: 입력한 인증코드가 서버에서 발급한 인증코드와 일치하는 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: 성공적으로 인증되었습니다
 *      '404':
 *        description: 입력한 인증번호가 서버에서 발급한 인증코드와 일치하지 않는 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 인증번호가 일치하지 않습니다
 *      '500':
 *        description: 서버에서 에러가 발생한 경우
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errorMessage:
 *                  type: string
 *                  example: 서버에서 에러가 발생하였습니다.
 */

router.post("/verify-authentication-code", async (req, res, next) => {
  try {
    const { authenticationCode, email } = req.body;

    // 인증번호가 일치하는지 확인
    const checkVerificationCode = await prisma.verificationCode.findFirst({
      where: {
        verificationCode: authenticationCode,
        email: email,
      },
    });

    if (checkVerificationCode) {
      // 이메일 및 인증코드가 일치하고 유효한 경우 해당 인증코드를 삭제
      await prisma.verificationCode.delete({
        where: {
          verificationCodeId: checkVerificationCode.verificationCodeId,
        },
      });
    } else {
      // 인증 실패
      return res
        .status(404)
        .json({ errorMessage: "인증번호가 일치하지 않습니다." });
    }

    return res.status(200).json({ message: "성공적으로 인증되었습니다" });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /auth/chcek-nickname:
 *   post:
 *    summary: 닉네임 중복확인
 *    description: 닉네임이 이미 사용중인 닉네임인지 확인한다
 *    tags:
 *      - Users
 *    responses:
 *     '200':
 *       description: 입력받은 닉네임이 유효한 경우
 *       content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *           message:
 *            type: string
 *            example: 중복검사 완료
 *        '409':
 *          description: 다른 사용자가 이미 같은 닉네임을 사용중인 경우
 *          content:
 *           application/json:
 *            schema:
 *             type: object
 *             properties:
 *              errorMessage:
 *               type: string
 *               example: 이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

router.post("/check-nickname", async (req, res, next) => {
  try {
    const validation = await nicknameSchema.validateAsync(req.body);
    const { nickname } = validation;

    const existNickname = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
    });

    if (existNickname) {
      return res.status(409).json({
        errorMessage:
          "이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.",
      });
    }

    return res.status(200).json({ message: "중복검사 완료" });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 사용자 등록
 *     description: POST 방식으로 사용자를 등록한다
 *     tags:
 *       - Users
 *     requestBody:
 *       description: 사용자가 서버에 전달하는 값에 따라 결과 값이 다르다 (사용자 등록)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmedPassword:
 *                 type: string
 *     responses:
 *       '201':
 *         description: 회원가입에 성공했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                  type: string
 *                  example: "회원가입이 완료되었습니다."
 *       '400':
 *         description: 비밀번호 일치하지 않을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: string
 *                  example: "비밀번호가 일치하지 않습니다. 다시 확인해주세요."
 *       '409':
 *         description: 중복된 이메일 주소나 닉네임을 입력했을 경우
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: stringnode
 *                  example: "중복된 닉네임입니다. 또는 중복된 이메일입니다."
 *       '500':
 *         description: "서버 에러가 발생했을 경우"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorMessage:
 *                  type: string
 *                  example: "서버에서 오류가 발생하였습니다."
 */

/** Register API */
router.post("/register", async (req, res, next) => {
  try {
    const validation = await registerSchema.validateAsync(req.body);
    const { nickname, email, password, confirmedPassword } = validation;

    if (password !== confirmedPassword) {
      return res.status(400).json({
        errorMessage: "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
      });
    }

    const encryptPassword = await bcrypt.hash(password, 10);

    const defaultImageUrl =
      "https://play-lh.googleusercontent.com/38AGKCqmbjZ9OuWx4YjssAz3Y0DTWbiM5HB0ove1pNBq_o9mtWfGszjZNxZdwt_vgHo=w240-h480-rw";

    await prisma.users.create({
      data: {
        email: email,
        password: encryptPassword,
        nickname: nickname,
        imgUrl: defaultImageUrl,
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /auth/login:
 *    post:
 *      summary: 로그인
 *      description: 이메일 주소와 비밀번호로 로그인
 *      tags:
 *        - Users
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        '200':
 *          description: 로그인에 성공했을 경우
 *          headers:
 *            Authorization:
 *              description: Bearer token for authentication
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            RefreshToken:
 *              description: Bearer token for refresh purposes
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            message:
 *              type: string
 *              example: "로그인에 성공하였습니다."
 *        '401':
 *          description: 입력된 비밀번호가 일치하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "비밀번호가 일치하지 않습니다."
 *        '404':
 *          description: 유저가 존재하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "해당 이메일로 가입된 계정이 없습니다."
 *        '500':
 *          description: 서버에서 발생한 에러일 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: "서버에서 오류가 발생하였습니다."
 */

/** Login API */
router.post("/login", async (req, res, next) => {
  try {
    const validation = await loginSchema.validateAsync(req.body);
    const { email, password } = validation;
    const secretKey = process.env.SECRET_TOKEN_KEY;

    // const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    // const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    const findUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      return res
        .status(404)
        .json({ errorMessage: "해당 이메일로 가입된 계정이 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
    }

    // Issue access token
    const accessToken = jwt.sign(
      {
        purpose: "access",
        userId: findUser.userId,
      },
      secretKey,
      { expiresIn: "30m" },
    );

    // Issue refresh token
    const refreshToken = jwt.sign(
      {
        purpose: "refresh",
        userId: findUser.userId,
      },
      secretKey,
      { expiresIn: "7d" },
    );

    const sevenDaysLater = new Date(); // 현재 시간
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장
    await prisma.refreshTokens.create({
      data: {
        refreshToken: refreshToken,
        UserId: findUser.userId,
        expiresAt: sevenDaysLater,
      },
    });

    // 응답 헤더로 전달
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Authorization, RefreshToken",
    );
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("RefreshToken", `Bearer ${refreshToken}`);

    //
    res.status(200).json({ message: "로그인에 성공하였습니다." });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ errorMessage: error.message });
    }

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /auth/tokens/refresh:
 *    post:
 *      summary: 엑세스 토큰 재발급
 *      description: 유효한 리프레시 토큰을 가지고 엑세스 토큰을 재발급 받는다
 *      tags:
 *        - Users
 *      responses:
 *        '200':
 *          description: 성공적으로 엑세스 토큰이 재발급된 경우
 *          headers:
 *            Authorization:
 *              description: Bearer token for authentication
 *              schema:
 *                type: string
 *                example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *            message:
 *              type: string
 *              example: "엑세스 토큰이 정상적으로 재발급되었습니다."
 *        '419':
 *          description: 전달받은 리프레시 토큰이 유효하지 않거나 존재하지 않을 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: Refresh token의 정보가 서버에 존재하지 않습니다.
 *        '500':
 *          description: 서버에서 오류가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 오류가 발생하였습니다.
 */

/** 리프레시 토큰을 이용해서 엑세스 토큰을 재발급하는 API */
router.post("/tokens/refresh", authMiddleware, async (req, res, next) => {
  try {
    const secretKey = process.env.SECRET_TOKEN_KEY;
    const { userId } = req.user;
    const { refreshToken } = req.headers;

    // 서버에서도 실제 정보를 가지고 있는지 확인
    const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
      where: {
        refreshToken: refreshToken, // 전달받은 토큰
      },
    });

    if (!isRefreshTokenExist) {
      return res.status(419).json({
        errorMessage: "Refresh token의 정보가 서버에 존재하지 않습니다.",
      });
    }

    const newAccessToken = jwt.sign(
      {
        purpose: "newaccess",
        userId: +userId,
      },
      secretKey,
      { expiresIn: "30m" },
    );

    console.log("새로 발급된 AccessToken: ", newAccessToken);

    res.setHeader("Authorization", `Bearer ${newAccessToken}`);

    return res
      .status(200)
      .json({ message: "엑세스 토큰이 정상적으로 재발급되었습니다." });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 문제가 발생하였습니다." });
  }
});

// 제공된 토큰이 유효한지 여부를 검증하는 함수
function validateToken(token, secretKey) {
  try {
    const accessToken = token.split(" ")[1]; // Bearer 제거 후 토큰 추출
    return jwt.verify(accessToken, secretKey);
  } catch (error) {
    return null;
  }
}

/**
 * @swagger
 * paths:
 *  /auth/logout:
 *    post:
 *      summary: 로그아웃
 *      description: 유저를 로그아웃 시키고 토큰을 무효화시킨다
 *      tags:
 *       - Users
 *      responses:
 *        '200':
 *          description: 성공적으로 로그아웃이 된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "로그아웃 되었습니다."
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

/** Logout API */
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    await prisma.tokenBlacklist.create({
      data: {
        token: req.headers.authorization,
      },
    });

    return res.status(200).json({
      message: "로그아웃 되었습니다.",
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/**
 * @swagger
 * paths:
 *  /auth/withdraw:
 *    delete:
 *      summary: 회원탈퇴
 *      description: 회원탈퇴를 요청받은 경우 유저 데이터를 삭제, 발급받은 리프레시 토큰을 무효화 시킨다
 *      tags: [Users]
 *      responses:
 *        '200':
 *          description: 유저의 정보가 삭제되고 성공적으로 회원탈퇴가 된 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "회원탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다."
 *        '500':
 *          description: 서버에서 에러가 발생한 경우
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  errorMessage:
 *                    type: string
 *                    example: 서버에서 에러가 발생하였습니다.
 */

/** Account Deletion API */
router.delete("/withdraw", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const findRefreshToken = await prisma.refreshTokens.findFirst({
      where: {
        UserId: +userId,
      },
      select: {
        refreshToken: true,
      },
    });

    if (findRefreshToken) {
      const refreshToken = findRefreshToken.refreshToken;

      // 리프레시 토큰을 블랙리스트에 추가
      await prisma.tokenBlacklist.create({
        data: {
          token: refreshToken,
        },
      });
    }

    await prisma.users.delete({
      where: {
        userId: +userId,
      },
    });

    return res.status(200).json({
      message:
        "회원탈퇴가 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.",
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

export default router;
