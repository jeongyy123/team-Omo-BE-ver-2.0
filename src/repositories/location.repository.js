import { prisma } from "../utils/prisma/index.js";

export class LocationRepository {
  // 둘러보기
  findAroundPosts = async (categoryName, qa, pa, ha, oa) => {
    // 위치 정보 가져오기 findAroundPosts

    let category;
    if (categoryName !== "전체") {
      category = await prisma.categories.findFirst({
        where: { categoryName },
      });
    } else {
      category = { categoryId: null };
    }

    const locations = await prisma.locations.findMany({
      where: {
        latitude: {
          gte: qa,
          lte: pa,
        },
        longitude: {
          gte: ha,
          lte: oa,
        },
        ...(category?.categoryId && { CategoryId: category.categoryId }),
      },
      select: {
        locationId: true,
        storeName: true,
        address: true,
        latitude: true,
        longitude: true,
        starAvg: true,
        postCount: true,
        Category: {
          select: {
            categoryName: true,
          },
        },
        Posts: {
          select: {
            postId: true,
            star: true,
            imgUrl: true,
          },
          take: 1,
        },
      },
    });

    return locations;
  };
  // 인기
  findPopularPosts = async (locationId) => {
    const posts = await prisma.posts.findMany({
      where: {
        LocationId: +locationId,
      },
      select: {
        User: {
          select: {
            nickname: true,
            imgUrl: true,
          },
        },
        postId: true,
        imgUrl: true,
        content: true,
        commentCount: true,
        likeCount: true,
        star: true,
        createdAt: true,
      },
    });

    return posts;
  };

  findPopularLocation = async (locationId) => {
    const location = await prisma.locations.findFirst({
      where: {
        locationId: +locationId,
      },
      select: {
        locationId: true,
        address: true,
        starAvg: true,
        postCount: true,
        storeName: true,
        placeInfoId: true,
        Posts: {
          select: {
            imgUrl: true,
          },
        },
      },
    });
    return location;
  };
}
