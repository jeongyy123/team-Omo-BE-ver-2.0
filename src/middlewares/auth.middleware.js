import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

dotenv.config();

export default async function (req, res, next) {
  try {
    const { authorization, refreshToken } = req.headers;
    const accessKey = process.env.SECRET_TOKEN_KEY;

    const [tokenType, token] = authorization.split(" ");

    if (!token) {
      return res
        .status(400)
        .json({ errorMessage: "토큰이 존재하지 않습니다." });
    }

    if (tokenType !== "Bearer") {
      return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
    }

    const decodedToken = validateToken(req.headers.authorization, accessKey);
    const { userId } = decodedToken;

    const blockUserAccess = await prisma.tokenBlacklist.findFirst({
      where: {
        token: token,
      },
    });

    if (blockUserAccess) {
      return res.status(403).json({ errorMessage: "접근 권한이 없습니다" });
    }

    if (refreshToken) {
      console.log("받은 refreshToken: ", refreshToken);
      const [tokenType, token] = refreshToken.split(" ");

      if (tokenType !== "Bearer") {
        return res.status(400).json({ errorMessage: "Bearer형식이 아닙니다." });
      }

      const blockUserRefresh = await prisma.tokenBlacklist.findFirst({
        where: {
          token: token,
        },
      });

      if (blockUserRefresh) {
        return res.status(403).json({ errorMessage: "접근 권한이 없습니다" });
      }
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

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({ errorMessage: "토큰이 만료되었습니다." });
  }
}

// Token을 검증하고 토큰 안에 있는 정보를 확인하기 위한 함수
function validateToken(token, secretKey) {
  try {
    const accessToken = token.split(" ")[1]; // Bearer 제거 후 토큰 추출
    return jwt.verify(accessToken, secretKey);
  } catch (error) {
    // 인증에 실패하거나 페이로드가 없을 경우에는 null을 반환
    return null;
  }
}
