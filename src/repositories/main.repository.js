import { prisma } from "../utils/prisma/index.js";

export class MainRepository {
  /* 인기글 조회 */
  getPoplurPosts = async (districtName, limit) => {
    const findDistrict = await prisma.districts.findFirst({
      where: { districtName },
    });

    const popularPosts = await prisma.posts.findMany({
      where: {
        Location: {
          ...(findDistrict?.districtId && {
            DistrictId: findDistrict.districtId,
          }),
        },
        likeCount: {
          gte: 3,
        },
      },
      select: {
        imgUrl: true,
        content: true,
        Location: {
          select: {
            locationId: true,
            storeName: true,
            latitude: true,
            longitude: true,
            address: true,
            starAvg: true,
            postCount: true,
            placeInfoId: true,
          },
        },
        Category: {
          select: {
            categoryName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: +limit,
    });

    return popularPosts;
  }

  /* 최신글 조회 */
  getRecentPosts = async (districtName, limit, categoryName) => {
    const findDistrict = prisma.districts.findFirst({
      where: { districtName },
    });

    const findLocations = prisma.locations.findMany({
      where: { DistrictId: findDistrict.districtId },
    });

    const category = await prisma.categories.findFirst({
      where: { categoryName },
    });

    const recentPosts = await prisma.posts.findMany({
      where: {
        ...(findLocations?.locationId && {
          LocationId: findLocations.locationId,
        }),
        ...(category?.categoryId && { CategoryId: category.categoryId }),
        Location: {
          ...(districtName && {
            District: {
              districtName,
            },
          }),
        },
      },
      select: {
        postId: true,
        imgUrl: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        User: {
          select: {
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: +limit,
    });

    return recentPosts;
  }

  /* 댓글 조회 */
  getRecentComments = async (districtName, limit) => {
    const findDistrict = await prisma.districts.findFirst({
      where: { districtName },
    });

    const recentComments = await prisma.comments.findMany({
      where: {
        ...(findDistrict?.districtId && {
          Post: {
            Location: {
              DistrictId: findDistrict.districtId,
            },
          },
        }),
      },
      select: {
        content: true,
        createdAt: true,
        PostId: true,
        Post: {
          select: {
            Location: {
              select: {
                address: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: +limit,
    });

    return recentComments;
  }
}