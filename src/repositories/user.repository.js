import { prisma } from "../utils/prisma/index.js";

export class UserRepository {
  existEmail = async (email) => {
    const existEmail = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    return existEmail;
  };

  saveVerificationCode = async (email, randomNumber) => {
    const result = await prisma.verificationCode.create({
      data: {
        email: email,
        verificationCode: randomNumber,
        expiryDate: new Date(Date.now() + 10 * 60 * 1000), // 예: 10분 후 만료
      },
    });

    return result;
  };

  findExpiredVerificationCodes = async () => {
    const expiredVerificationCodes = await prisma.verificationCode.findMany({
      where: {
        expiryDate: {
          lt: new Date(), // 현재 시간보다 이전인 데이터를 찾는다.
        },
      },
    });

    return expiredVerificationCodes;
  };

  checkVerificationCode = async (authenticationCode, email) => {
    // 인증번호가 일치하는지 확인
    const checkVerificationCode = await prisma.verificationCode.findFirst({
      where: {
        verificationCode: parseInt(authenticationCode),
        email: email,
      },
    });

    return checkVerificationCode;
  };

  deleteUsedVerificationCode = async (checkVerificationCode) => {
    // 인증번호가 일치하는 경우에만 삭제
    const result = await prisma.verificationCode.delete({
      where: {
        verificationCodeId: checkVerificationCode.verificationCodeId,
      },
    });

    return result;
  };

  existNickname = async (nickname) => {
    const existNickname = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
    });

    return existNickname;
  };

  createUser = async (email, encryptPassword, nickname, defaultImageUrl) => {
    const result = await prisma.users.create({
      data: {
        email: email,
        password: encryptPassword,
        nickname: nickname,
        imgUrl: defaultImageUrl,
      },
    });

    return result;
  };

  findUser = async (email) => {
    const findUser = await prisma.users.findFirst({
      where: {
        email: email,
      },
    });

    return findUser;
  };

  saveRefreshToken = async (refreshToken, foundUserId, sevenDaysLater) => {
    const result = await prisma.refreshTokens.create({
      data: {
        refreshToken: refreshToken,
        UserId: foundUserId,
        expiresAt: sevenDaysLater,
      },
    });

    return result;
  };

  isRefreshTokenExist = async (token, userId) => {
    // 데이터베이스에서 유효한 리프레시 토큰인지 확인
    const isRefreshTokenExist = await prisma.refreshTokens.findFirst({
      where: {
        refreshToken: token, // 전달받은 토큰
        UserId: +userId,
      },
    });

    return isRefreshTokenExist;
  };

  deletePreviousRefreshToken = async (token, tokenId) => {
    // 새로운 엑세스 토큰을 발급하기 전에 이전 리프레시 토큰을 데이터베이스에서 삭제
    const result = await prisma.refreshTokens.delete({
      where: {
        refreshToken: token,
        // UserId: +userId,
        tokenId: tokenId,
      },
    });

    return result;
  };

  saveRefreshToken = async (newRefreshToken, userId, sevenDaysLater) => {
    // 리프레시 토큰을 생성하고 이를 데이터베이스에 저장한다
    const result = await prisma.refreshTokens.create({
      data: {
        refreshToken: newRefreshToken,
        UserId: userId,
        expiresAt: sevenDaysLater, // 유효기간 7일
      },
    });

    return result;
  };

  findTokenId = async (userId) => {
    const findTokenId = await prisma.refreshTokens.findFirst({
      where: {
        UserId: +userId,
      },
      select: {
        tokenId: true,
      },
    });

    return findTokenId;
  };

  userLogout = async (userId, findTokenId) => {
    const result = await prisma.refreshTokens.delete({
      where: {
        UserId: +userId,
        tokenId: findTokenId.tokenId,
      },
    });

    return result;
  };

  deleteUserInfo = async (userId) => {
    // 트랜젝션 시작
    const result = await prisma.$transaction([
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

    return result;
  };
}
