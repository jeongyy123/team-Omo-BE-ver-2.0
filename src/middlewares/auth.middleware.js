import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

dotenv.config();

export default async function (req, res, next) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    // const accessToken = req.headers.authorization;
    // const refreshToken = req.headers.authorization;

    console.log("받은 accessToken >>>>>>>", accessToken);
    console.log("받은 refreshToken >>>>>>", refreshToken);

    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    // 위 토큰이 실제로 존재하는지 확인한다.
    if (!accessToken || !refreshToken) {
      return res
        .status(400)
        .json({ errorMessage: "토큰이 존재하지 않습니다." });
    }

    // Refresh Token이 블랙리스트에 있는지 확인
    const blockUserRefresh = await prisma.tokenBlacklist.findFirst({
      where: {
        token: refreshToken,
      },
    });

    // Access Token이 블랙리스트에 있는지 확인
    const blockUserAccess = await prisma.tokenBlacklist.findFirst({
      where: {
        token: accessToken,
      },
    });

    if (blockUserRefresh || blockUserAccess) {
      return res.status(403).json({ errorMessage: "접근 권한이 없습니다" });
    }

    // 토큰이 서버에서 발급된 토큰이고 존재하는지 확인
    const decodedAccessToken = validateToken(accessToken, accessKey);

    // ==========================================================================================
    // ========================엑세스 토큰 재발급=================================================
    // 엑세스 토큰이 만료되었거나 유효하지 않은 경우 리프레시 토큰으로 새로운 엑세스 토큰을 발급한다.
    if (!decodedAccessToken) {
      if (!refreshToken) {
        return res
          .status(404)
          .json({ errorMessage: "Refresh Token이 존재하지 않습니다." });
      }

      // 서버에서 전달한 Refresh token이 맞는지 확인
      const decodedRefreshToken = validateToken(refreshToken, refreshKey);

      // 서버에서 발급한 Refresh token안에 있는 유저정보
      const { userId } = decodedRefreshToken;

      if (!decodedRefreshToken) {
        return res
          .status(401)
          .json({ errorMessage: "Refresh token이 유효하지 않습니다." });
      }

      // 서버에서도 실제 정보를 가지고 있는지 확인
      const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
        where: {
          refreshToken: refreshToken, // 전달받은 토큰
        },
      });

      console.log("isRefreshTokenExist >>>>>>>>>>>", isRefreshTokenExist);

      if (!isRefreshTokenExist) {
        return res.status(419).json({
          errorMessage: "Refresh token의 정보가 서버에 존재하지 않습니다.",
        });
      }

      // 새로운 엑세스 토큰 발급 로직
      const newAccessToken = jwt.sign(
        {
          purpose: "access",
          userId: +userId,
        },
        accessKey,
        { expiresIn: "2h" },
      );

      console.log("새롭게 재발급 받은 AccessToken >>>>>>>>>", newAccessToken);

      res.cookie("accessToken", newAccessToken);
    }
    // =============================================================================

    // 서버에서 발급한 엑세스 토큰안에 있는 유저정보
    const { userId } = decodedAccessToken;

    const user = await prisma.users.findUnique({
      where: {
        userId: +userId,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ errorMessage: "사용자가 존재하지 않습니다." });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생했습니다." });
  }
}

// Token을 검증하고 토큰 안에 있는 정보를 확인하기 위한 함수
function validateToken(token, secretKey) {
  try {
    // 인증에 성공했을 때 해당하는 정보, 즉 페이로드가 반환
    return jwt.verify(token, secretKey);
  } catch (error) {
    // 인증에 실패하거나 페이로드가 없을 경우에는 null을 반환
    return null;
  }
}
