import { prisma } from "../utils/prisma/index.js";

export class SearchingRepository {

  getSearchingByStoreName = async (storeName) => {
    const findStores = await prisma.posts.findMany({
      where: {
        Location: {
          storeName: {
            contains: storeName
          }
        }
      },
      select: {
        postId: true,
        likeCount: true,
        commentCount: true,
        star: true,
        content: true,
        Location: {
          select: {
            locationId: true,
            storeName: true,
            address: true,
            starAvg: true,
            latitude: true,
            longitude: true,
            starAvg: true,
            postCount: true,
            placeInfoId: true,
          }
        },
        Category: {
          select: {
            categoryName: true
          }
        },
        User: {
          select: {
            userId: true,
            nickname: true,
          },
        },
      }
    })
    return findStores;
  }

  getSearchingByNickname = async (nickname) => {
    const findUsers = await prisma.users.findMany({
      where: {
        nickname: {
          contains: nickname,
        }
      },
      select: {
        userId: true,
        nickname: true,
        imgUrl: true,
      }
    })

    return findUsers;
  }
}