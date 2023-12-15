import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

dotenv.config();

export default async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    console.log("authorizationHeader >>>>>>>>>>>>>>>>>", authorizationHeader);

    if (!authorizationHeader) {
      return res
        .status(401)
        .json({ errorMessage: "Authorization 헤더가 없습니다." });
    }

    const [tokenType, token] = authorizationHeader.split(" ");

    console.log("받은 token >>>>>>>", token);

    const accessKey = process.env.SECRET_TOKEN_KEY;

    // 1. 받은 토큰이 엑세스 토큰이 아니라 리프레시 토큰일 경우에만 검사 ********
    // 2. 받은 리프레시 토큰의 유효기간이 남아있는지 확인해야 한다.
    // 3. 엑세스 토큰 비밀키랑 리프레시 토큰 비밀키가 같음..
    // --
    // const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
    //   where: {
    //     refreshToken: token, // 전달받은 토큰
    //   },
    // });

    // console.log("isRefreshTokenExist >>>>>>>>>>>", isRefreshTokenExist);

    // if (!isRefreshTokenExist) {
    //   return res.status(419).json({
    //     errorMessage: "Refresh token의 정보가 서버에 존재하지 않습니다.",
    //   });
    // }
    // ******************************************************************

    // 위 토큰이 실제로 존재하는지 확인한다.
    if (!token) {
      return res
        .status(400)
        .json({ errorMessage: "토큰이 존재하지 않습니다." });
    }

    if (tokenType !== "Bearer") {
      return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
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

    // 토큰이 서버에서 발급된 토큰이고 존재하는지 확인
    const decodedToken = validateToken(token, accessKey);

    // 토큰이 만료되었는지 확인
    // const isTokenExpired = Date.now() >= decodedAccessToken.exp * 1000;
    // const isTokenExpired = decodedAccessToken
    //   ? Date.now() >= decodedAccessToken.exp * 1000
    //   : false;

    //--------------------------------------------------------------------
    // if (isTokenExpired) {
    //   const [refreshTokenType, refreshToken] = authorizationHeader.split(" ");

    //   console.log("받은 refreshToken >>>>>>>", refreshToken);

    //   const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    //   // 위 토큰이 실제로 존재하는지 확인한다.
    //   if (!refreshToken) {
    //     return res
    //       .status(400)
    //       .json({ errorMessage: "토큰이 존재하지 않습니다." });
    //   }

    //   if (refreshTokenType !== "Bearer") {
    //     return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
    //   }

    //   // Access Token이 블랙리스트에 있는지 확인
    //   const blockUserRefresh = await prisma.tokenBlacklist.findFirst({
    //     where: {
    //       token: refreshToken,
    //     },
    //   });

    //   if (blockUserRefresh) {
    //     return res.status(403).json({ errorMessage: "접근 권한이 없습니다" });
    //   }

    //   // 토큰이 서버에서 발급된 토큰이고 존재하는지 확인
    //   const decodedRefreshToken = validateToken(refreshToken, refreshKey);

    //   const isRefreshTokenExpired = decodedRefreshToken
    //     ? Date.now() >= decodedRefreshToken.exp * 1000
    //     : false;

    //   if (isRefreshTokenExpired) {
    //     return res
    //       .status(401)
    //       .json({ errorMessage: "Refresh 토큰이 만료되었습니다." });
    //   }

    //   // 서버에서 발급한 엑세스 토큰안에 있는 유저정보
    //   const { userId } = decodedRefreshToken;

    //   const user = await prisma.users.findUnique({
    //     where: {
    //       userId: +userId,
    //     },
    //   });

    //   if (!user) {
    //     return res
    //       .status(404)
    //       .json({ errorMessage: "사용자가 존재하지 않습니다." });
    //   }

    //   req.user = user;
    // } else {
    //--------------------------------------------------------------------------

    // 서버에서 발급한 엑세스 토큰안에 있는 유저정보
    const { userId } = decodedToken;

    // if (!userId) {
    //   return res
    //     .status(404)
    //     .json({ errorMessage: "사용자가 존재하지 않습니다." });
    // }

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
