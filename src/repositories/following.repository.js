export class FollowingRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }
  findUserByUserFromId = async (userToId) => {
    return await this.prisma.users.findFirst({
      where: {
        userId: +userToId,
      },
    });
  };

  findFollowers = async (userFromId, userToId) => {
    return await this.prisma.follows.findFirst({
      where: {
        userFromId: +userFromId,
        userToId: +userToId,
      }
    })
  }

  createFollower = async (userFromId, userToId) => {
    return await this.prisma.follows.create({
      data: {
        userFromId: +userFromId,
        userToId: +userToId,
      },
    });
  };

  deleteFollower = async (findFollowers) => {
    return await this.prisma.follows.delete({
      where: {
        followsId: +findFollowers.followsId,
      },
    });
  };

  getFollowingList = async (userFromId) => {
    return await this.prisma.$queryRaw`SELECT U.userId, U.nickname, U.imgUrl, F.userFromId 
      FROM Users U 
      JOIN Follows F ON U.userId = F.userToId
      WHERE F.userFromId = ${userFromId};`;
  };

  getFollowersList = async (userFromId) => {
    return await this.prisma.$queryRaw`SELECT U.userId, U.nickname, U.imgUrl, F.userToId 
      FROM Users U 
      JOIN Follows F ON U.userId = F.userFromId
      WHERE F.userToId = ${userFromId};`;
  }

}