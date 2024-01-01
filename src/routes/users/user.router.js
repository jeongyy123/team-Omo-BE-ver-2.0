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

    console.log("사용자가 입력한 이메일 주소  >>>", email);

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

    // 만료시간 이후에 삭제가 되어야함.
    // 인증번호를 확인하는 api에서 삭제요청 들어감

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

router.post("/verify-authentication-code", async (req, res, next) => {
  try {
    const { authenticationCode, email } = req.body;
    console.log("authenticationCode >>>", authenticationCode);

    // ==========================================================================
    // 이미 만료기간이 지난 인증번호를 db에서 지우자
    // 현재 시간보다 expiryDate가 이전인 인증번호를 조회.
    // 만약 클라이언트가 이전에 발급받은 만료된 인증번호를 사용할 수도 있으니까!
    const expiredVerificationCodes = await prisma.verificationCode.findMany({
      where: {
        expiryDate: {
          lt: new Date(), // 현재 시간보다 이전인 데이터를 찾는다.
        },
      },
    });

    // 만료된 인증번호를 삭제.
    for (const code of expiredVerificationCodes) {
      await prisma.verificationCode.delete({
        where: {
          verificationCodeId: code.verificationCodeId,
        },
      });
    }
    // ============================================================================

    // 인증번호가 일치하는지 확인
    const checkVerificationCode = await prisma.verificationCode.findFirst({
      where: {
        verificationCode: parseInt(authenticationCode),
        email: email,
      },
    });

    // 클라이언트가 인증 정보를 제공하지 않으면
    if (!checkVerificationCode) {
      return res.status(404).json({
        errorMessage: "인증번호가 일치하지 않습니다.",
      });
    }

    // 인증번호가 일치하는 경우에만 삭제
    await prisma.verificationCode.delete({
      where: {
        verificationCodeId: checkVerificationCode.verificationCodeId,
      },
    });

    return res
      .status(200)
      .json({ message: "인증번호가 성공적으로 확인되었습니다." });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

router.post("/check-nickname", async (req, res, next) => {
  try {
    const validation = await nicknameSchema.validateAsync(req.body);
    const { nickname } = validation;

    const existNickname = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
    });

    console.log("existNickname >>>>>", existNickname);

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
      "0b2f746651bb7e903bd2c985714170b8746f0fc6d9a966ba31476e515495ebd1";

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

/** Login API */
router.post("/login", async (req, res, next) => {
  try {
    const validation = await loginSchema.validateAsync(req.body);
    const { email, password } = validation;
    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    const findUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (!findUser) {
      return res
        .status(404)
        .json({ errorMessage: "해당 이메일로 가입된 내역이 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);

    if (!isMatch) {
      return res.status(401).json({
        errorMessage: "비밀번호가 틀립니다. 다시 한 번 확인해 주세요.",
      });
    }

    // Issue access token
    const accessToken = jwt.sign(
      {
        purpose: "access",
        userId: findUser.userId,
      },
      accessKey,
      { expiresIn: "30s" },
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
    res.status(200).json({ userId: findUser.userId });
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

/** 리프레시 토큰을 이용해서 엑세스 토큰을 재발급하는 API */
router.post("/tokens/refresh", async (req, res, next) => {
  try {
    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;
    const { refreshtoken } = req.headers;

    console.log("Test >>>", refreshtoken);
    console.log("req.headers >>>", req.headers);

    const [tokenType, token] = refreshtoken.split(" ");

    if (!token) {
      return res
        .status(400)
        .json({ errorMessage: "토큰이 존재하지 않습니다." });
    }

    if (tokenType !== "Bearer") {
      return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
    }

    const decodedToken = jwt.verify(token, refreshKey);

    if (!decodedToken) {
      return res
        .status(401)
        .json({ errorMessage: "리프레시 토큰이 유효하지 않습니다." });
    }

    const { userId } = decodedToken;

    // 데이터베이스에서 유효한 리프레시 토큰인지 확인
    const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
      where: {
        refreshToken: refreshtoken, // 전달받은 토큰
        expiresAt: {
          gte: new Date(), // 만료되지 않은 토큰인지 확인
        },
        UserId: +userId,
      },
    });

    if (!isRefreshTokenExist) {
      // 만료된 리프레시 토큰은 데이터베이스에서 삭제되어야 합니다.
      await prisma.refreshTokens.delete({
        where: {
          refreshToken: refreshtoken,
        },
      });

      return res.status(419).json({
        errorMessage: "리프레시 토큰이 유효하지 않습니다.",
      });
    }

    const newAccessToken = jwt.sign(
      {
        purpose: "newaccess",
        userId: userId,
      },
      accessKey,
      { expiresIn: "30s" },
    );

    const newRefreshToken = jwt.sign(
      {
        purpose: "newrefresh",
        userId: userId,
      },
      refreshKey,
      { expiresIn: "7d" },
    );

    // 새로운 엑세스 토큰을 발급하기 전에 이전 리프레시 토큰을 데이터베이스에서 삭제
    await prisma.refreshTokens.delete({
      where: {
        refreshToken: refreshtoken,
      },
    });

    const sevenDaysLater = new Date(); // 현재 시간
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // 리프레시 토큰을 생성하고 이를 데이터베이스에 저장한다
    await prisma.refreshTokens.create({
      data: {
        refreshToken: newRefreshToken,
        UserId: userId,
        expiresAt: sevenDaysLater, // 유효기간 7일
      },
    });

    console.log("새로 발급된 AccessToken: ", newAccessToken);
    console.log("새로 발급된 RefreshToken: ", newRefreshToken);

    res.setHeader("Authorization", `Bearer ${newAccessToken}`);
    res.setHeader("RefreshToken", `Bearer ${newRefreshToken}`);

    return res.status(200).json({ userId });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 문제가 발생하였습니다." });
  }
});

/** Logout API */
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    await prisma.refreshTokens.delete({
      where: {
        UserId: +userId,
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

/** Account Deletion API */
router.delete("/withdraw", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    /** 트랜젝션 사용 - 작업의 완전성을 보장해 주기 위함 */
    // 트랜젝션 시작
    // prisma.$transaction을 사용하여 배열 안에 여러 프리즈마 쿼리를 넣어 실행한다
    // 트랜젝션 내의 모든 작업이 성공하거나, 실패할 경우 롤백된다.
    await prisma.$transaction([
      prisma.refreshTokens.deleteMany({
        where: {
          UserId: +userId,
        },
      }),
      prisma.users.delete({
        where: {
          userId: +userId,
        },
      }),
    ]); // 트랜젝션 끝

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
