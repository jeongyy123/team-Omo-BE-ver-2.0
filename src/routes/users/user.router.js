import express from "express";
import { prisma } from "../../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import authMiddleware from "../../middlewares/auth.middleware.js";

dotenv.config();
const router = express.Router();

/** Register API */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    const existUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    if (existUser) {
      return res.status(409).json({ errorMessage: "중복된 이메일입니다." });
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

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/** Login API
 * 사용자 인증 후, Access Token과 Refresh Token을 반환
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
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
        userId: findUser.userId,
      },
      accessKey,
      { expiresIn: "1h" },
    );

    // Issue refresh token
    const refreshToken = jwt.sign(
      {
        userId: findUser.userId,
      },
      refreshKey,
      { expiresIn: "7d" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    // 클라이언트에서 토큰을 사용할 때 매번 "Bearer "를 제거해야 하는 번거로움이 있을 수 있어서 지웠음
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    const sevenDaysLater = new Date(); // 현재 시간
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    // Refresh Token을 가지고 해당 유저의 정보를 서버에 저장
    await prisma.refreshTokens.create({
      data: {
        refreshToken: refreshToken,
        UserId: findUser.userId,
        expiresAt: sevenDaysLater,
        // createdAt 필드는 기본값이 있으므로 따로 설정할 필요 없음
      },
    });

    return res.status(200).json({ message: "로그인이 완료되었습니다." });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다." });
  }
});

/** 리프레시 토큰을 이용해서 엑세스 토큰을 재발급하는 API
 * Access Token의 만료를 감지하고, Refresh Token을 사용하여 새로운 Access Token을 발급하는 API
 */
router.post("/tokens/refresh", authMiddleware, async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;
  const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;

  // 클라이언트가 위 Refresh token을 실제로 가지고 있는지 확인
  if (!refreshToken) {
    return res
      .status(400)
      .json({ errorMessage: "Refresh Token이 존재하지 않습니다." });
  }

  // 서버에서 전달한 Refresh token이 맞는지 확인
  const decodedToken = validateToken(refreshToken, refreshKey);

  if (!decodedToken) {
    return res
      .status(401)
      .json({ errorMessage: "Refresh token이 유효하지 않습니다." });
  }

  // 서버에서도 실제 정보를 가지고 있는지 확인
  const userInfo = await prisma.refreshTokens.findMany({
    where: {
      refreshToken: refreshToken,
    },
  });

  if (!userInfo) {
    return res.status(419).json({
      errorMessage: "Refresh token의 정보가 서버에 존재하지 않습니다.",
    });
  }

  // 새로운 Access token을 발급
  const newAccessToken = jwt.sign(
    {
      userId: userInfo.userId,
    },
    accessKey,
    { expiresIn: "1h" },
  );

  res.cookie("accessToken", newAccessToken);

  return res
    .status(200)
    .json({ message: "Access Token을 정상적으로 새롭게 발급했습니다." });
});

// 제공된 토큰이 유효한지 여부를 검증하는 함수
function validateToken(token, secretKey) {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
}

/** Logout API
 * 현재의 인증 상태를 해제하는 작업
 */
router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    // const accessToken = req.headers.authorization;
    // const refreshToken = req.headers.authorization;

    // 클라이언트가 보낸 accessToken과 refreshToken을 블랙리스트에 추가
    await prisma.tokenBlacklist.createMany({
      data: [{ token: accessToken }, { token: refreshToken }],
    });

    // 쿠키를 삭제하여 클라이언트에 저장된 토큰을 제거!!
    res.clearCookie(accessToken);
    res.clearCookie(refreshToken);

    // 나중에 클라이언트 측에서 로컬 스토리지나 쿠키 등에 저장된 토큰을 삭제하라고 요청하기!
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

/** 회원탈퇴 API
 * 해당 사용자의 리프레시 토큰을 무효화
 */
router.delete("/withdraw", authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { refreshToken } = req.cookies;
    // const refreshToken = req.headers.authorization;

    // 블랙리스트에 해당 토큰을 추가
    await prisma.tokenBlacklist.create({
      data: {
        token: refreshToken,
      },
    });

    // 회원 삭제
    await prisma.users.delete({
      where: {
        userId: +userId,
      },
    });

    // 나중에 클라이언트 측에서 로컬 스토리지나 쿠키 등에 저장된 토큰을 삭제하라고 요청하기!
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
