import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

dotenv.config();

export default async function (req, res, next) {
  try {
    // console.log("req.headers", req.headers);
    // req.headers에서 authorization과 refresh-token 헤더를 읽음
    // host, cookie, user-agent, authorization, accept, content-length
    const { authorization, "refresh-token": refreshToken } = req.headers;
    const accessKey = process.env.SECRET_TOKEN_KEY;

    const [tokenType, token] = authorization.split(" ");

    console.log("받은 token >>>>>>>", token);

    // 위 토큰이 실제로 존재하는지 확인한다.
    if (!token) {
      return res
        .status(400)
        .json({ errorMessage: "토큰이 존재하지 않습니다." });
    }

    if (tokenType !== "Bearer") {
      return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
    }

    // 토큰이 서버에서 발급된 토큰이고 존재하는지 확인
    const decodedToken = validateToken(token, accessKey);

    // 서버에서 발급한 엑세스 토큰안에 있는 유저정보
    const { userId } = decodedToken;

    const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!isRefreshTokenExist) {
      return res
        .status(400)
        .json({ errorMessage: "Refresh token이 존재하지 않습니다." });
    }

    // Access Token or Refresh token 이 블랙리스트에 있는지 확인
    const blockUserAccess = await prisma.tokenBlacklist.findFirst({
      where: {
        token: tokenType,
      },
    });

    if (blockUserAccess) {
      return res.status(403).json({ errorMessage: "접근 권한이 없습니다" });
    }

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
    console.log("req.user",user)
    next();
    // }
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ errorMessage: "전달된 토큰에서 오류가 발생했습니다." });
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