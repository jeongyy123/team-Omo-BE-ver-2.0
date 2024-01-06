import { AuthRepository } from "../repositories/auth.repository.js";
import jwt from "jsonwebtoken";

export class AuthService {
  authRepository = new AuthRepository();

  handleKakaoCallback = async (user) => {
    const accessKey = process.env.ACCESS_TOKEN_SECRET_KEY;
    const refreshKey = process.env.REFRESH_TOKEN_SECRET_KEY;

    if (user) {
      const userId = user.userId; // 사용자 ID를 가져옴

      // Issue access token
      const accessToken = jwt.sign(
        {
          purpose: "access",
          userId,
        },
        accessKey,
        { expiresIn: "2h" },
      );

      // Issue refresh token
      const refreshToken = jwt.sign(
        {
          purpose: "refresh",
          userId,
        },
        refreshKey,
        { expiresIn: "7d" },
      );

      const sevenDaysLater = new Date(); // 현재 시간
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

      await this.authRepository.saveRefreshToken(
        refreshToken,
        userId,
        sevenDaysLater,
      );

      return { accessToken, refreshToken, userId };
    }
  };
}
