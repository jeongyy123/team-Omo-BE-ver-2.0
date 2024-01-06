import { prisma } from "../utils/prisma/index.js";

export class AuthRepository {
  saveRefreshToken = async (refreshToken, userId, sevenDaysLater) => {
    try {
      const result = await prisma.refreshTokens.create({
        data: {
          refreshToken: refreshToken,
          UserId: +userId,
          expiresAt: sevenDaysLater,
        },
      });

      return result;
    } catch (err) {
      console.error(err);
      throw new Error("리프레시 토큰 저장중에 에러 발생");
    }
  };
}
