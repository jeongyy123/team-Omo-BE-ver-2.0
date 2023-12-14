import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

dotenv.config();

export default async function (req, res, next) {
  try {
    const { accessToken, refreshToken } = req.cookies;
    // const accessToken = req.headers.authorization;
    // const refreshToken = req.headers.authorization;
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

    // 토큰이 서버에서 발급된 토큰인지 확인
    const decodedAccessToken = validateToken(accessToken, accessKey);
    const decodedRefreshToken = validateToken(refreshToken, refreshKey);

    if (!decodedAccessToken || !decodedRefreshToken) {
      return (
        res
          // 401 Unauthorized
          .status(401)
          .json({ errorMessage: "토큰이 만료되었습니다" })
      );
    }

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
