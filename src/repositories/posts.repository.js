import { prisma } from "../utils/prisma/index.js";

export class PostsRepository {
  /* 게시글 목록 조회 */
  findAllPosts = async (page, lastSeenPage, categoryName, districtName) => {
    const parsedPage = parseInt(page, 10) || 1;

    const findCategory = categoryName
      ? await prisma.categories.findFirst({ where: { categoryName } })
      : null;
    const findDistrict = districtName
      ? await prisma.districts.findFirst({ where: { districtName } })
      : null;

    const posts = await prisma.posts.findMany({
      select: {
        User: {
          select: {
            nickname: true,
          },
        },
        Category: {
          select: {
            categoryName: true,
          },
        },
        Location: {
          select: {
            locationId: true,
            storeName: true,
            address: true,
            starAvg: true,
            postCount: true,
          },
        },
        postId: true,
        imgUrl: true,
        content: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
      },
      orderBy: { postId: "desc" },
      take: parsedPage,
      skip: lastSeenPage ? 1 : 0,
      ...(+lastSeenPage && { cursor: { postId: +lastSeenPage } }),
      where: {
        ...(findCategory?.categoryId && {
          CategoryId: findCategory.categoryId,
        }),
        ...(findDistrict?.districtId && {
          Location: { DistrictId: findDistrict.districtId },
        }),
        updatedAt: {
          lt: new Date(),
        },
      },
    });

    return posts;
  }
  /* 게시글 상세 조회 */
  findPostById = async (postId) => {
    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
      select: {
        postId: true,
        content: true,
        createdAt: true,
        likeCount: true,
        commentCount: true,
        imgUrl: true,
        star: true,
        User: {
          select: {
            userId: true,
            nickname: true,
            imgUrl: true,
          },
        },
        Location: {
          select: {
            locationId: true,
            address: true,
            storeName: true,
            latitude: true,
            longitude: true,
            postCount: true,
            placeInfoId: true,
            Category: {
              select: {
                categoryId: true,
                categoryName: true,
              },
            },
          },
        },
      },
    });

    return post;
  }

  /* 게시글 작성 */
  createPost = async (
    userId,
    content,
    categoryName,
    storeName,
    address,
    latitude,
    longitude,
    star,
    placeInfoId,
    imgNames) => {

    const category = await prisma.categories.findFirst({
      where: { categoryName },
    });

    const district = await prisma.districts.findFirst({
      where: { districtName: address.split(" ")[1] },
    });

    const location = await prisma.locations.findFirst({
      where: { address },
    });

    //location 정보가 기존 X => location랑 posts 생성.
    if (!location) {
      await prisma.$transaction(async (prisma) => {
        const createLocation = await prisma.locations.create({
          data: {
            storeName,
            address,
            latitude,
            longitude,
            starAvg: star || 0,
            postCount: 1,
            placeInfoId,
            Category: { connect: { categoryId: +category.categoryId } },
            District: { connect: { districtId: +district.districtId } },
            User: { connect: { userId: +userId } },
          },
        });

        await prisma.posts.create({
          data: {
            content,
            star,
            likeCount: 0,
            User: { connect: { userId: +userId } },
            Category: { connect: { categoryId: +category.categoryId } },
            Location: {
              connect: { locationId: +createLocation.locationId },
            },
            imgUrl: imgNames.join(","),
          },
        });
      });
    } else {
      //location 정보가 기존 O => location 업데이트, posts 생성
      await prisma.$transaction(async (prisma) => {
        await prisma.posts.create({
          data: {
            content,
            star,
            likeCount: 0,
            User: { connect: { userId: +userId } },
            Category: { connect: { categoryId: +category.categoryId } },
            Location: { connect: { locationId: +location.locationId } },
            imgUrl: imgNames.join(","),
          },
        });

        const starsAvg = await prisma.posts.aggregate({
          where: { LocationId: location.locationId },
          _avg: {
            star: true,
          },
        });

        await prisma.locations.update({
          where: {
            locationId: location.locationId,
          },
          data: {
            starAvg: starsAvg._avg.star,
            postCount: {
              increment: 1,
            },
          },
        });
      });
    }
    return { message: "게시글 등록이 완료되었습니다." }
  }

  /* 카테고리 찾기 */
  findCategory = async (categoryName) => {
    return await prisma.categories.findFirst({
      where: { categoryName },
    });
  }

  /* 자치구 찾기 */
  findDistrict = async (address) => {
    return await prisma.districts.findFirst({
      where: { districtName: address.split(" ")[1] },
    });
  }

  /* 게시글 수정 */
  updatePost = async (userId, postId, address, content, star, storeName, placeInfoId, latitude, longitude, categoryName) => {

    const post = await prisma.posts.findFirst({
      where: { postId: +postId },
    });

    // 수정 후 category 정보
    const category = await prisma.categories.findFirst({
      where: { categoryName }
    });

    // 수정 후 district 정보
    const district = await prisma.districts.findFirst({
      where: { districtName: address.split(" ")[1] },
    });

    // if (!district) {
    //   return res.status(400).json({ message: "지역이 존재하지 않습니다." });
    // }

    // 수정 후 location 정보
    const afterEditPostLocation = await prisma.locations.findFirst({
      where: { address }
    })

    // 수정 후 location 정보가 있을 경우 
    // -> post 수정( content, star ) & location 수정 ( starAvg, postCount )
    if (afterEditPostLocation) {
      await prisma.$transaction(async (prisma) => {
        const createPost = await prisma.posts.update({
          where: { postId: +postId, UserId: +userId },
          data: {
            LocationId: afterEditPostLocation.locationId,
            content,
            star,
          },
        });

        const starAvg = await prisma.posts.aggregate({
          where: { LocationId: createPost.LocationId },
          _avg: {
            star: true,
          },
        });

        // 수정 후 location
        await prisma.locations.update({
          where: {
            locationId: afterEditPostLocation.locationId,
          },
          data: {
            starAvg: starAvg._avg.star,
            postCount: {
              increment: 1
            }
          },
        });

        // 수정 전 post의 location.postCount decrement
        const beforeEditPostLocation = await prisma.locations.update({
          where: { locationId: post.LocationId },
          data: {
            postCount: {
              decrement: 1
            }
          }
        })

        // 만약 수정 후에 기존 location.postcount가 0이 된다면 삭제
        if (beforeEditPostLocation.postCount === 0) {
          await prisma.locations.delete({
            where: { locationId: beforeEditPostLocation.locationId }
          })
        }
      });
    } else {
      // 수정 후 location 정보가 없는경우 
      // -> post정보 수정 & 수정 후 location 정보 생성 
      // -> 수정 전 location 정보 수정 
      await prisma.$transaction(async (prisma) => {
        // 수정 후의 location 정보 create
        const location = await prisma.locations.create({
          data: {
            starAvg: 0,
            address,
            storeName,
            placeInfoId,
            latitude,
            longitude,
            postCount: 1,
            Category: { connect: { categoryId: +category.categoryId } },
            District: { connect: { districtId: +district.districtId } },
            User: { connect: { userId: +userId } },
          },
        });

        const createPost = await prisma.posts.update({
          where: { postId: +postId, UserId: +userId },
          data: {
            LocationId: location.locationId,
            content,
            star,
          },
        });

        const starAvg = await prisma.posts.aggregate({
          where: { LocationId: createPost.LocationId },
          _avg: {
            star: true,
          },
        });

        //starAvg 갱신
        await prisma.locations.update({
          where: { locationId: location.locationId },
          data: {
            starAvg: starAvg._avg.star
          }
        })

        // 수정 전 post의 location decrement 하기
        const beforeEditPostLocation = await prisma.locations.update({
          where: { locationId: post.LocationId },
          data: {
            postCount: {
              decrement: 1
            }
          }
        })

        // 수정 전 location.postcount가 0이 되면 지워
        if (beforeEditPostLocation.postCount === 0) {
          await prisma.locations.delete({
            where: { locationId: beforeEditPostLocation.locationId }
          })
        }
      });
    }
  }

  /* 게시글 찾기 by PostId, UserId */
  findPostByPostIdAndUserId = async (userId, postId) => {
    return await prisma.posts.findFirst({
      where: { postId: +postId, UserId: +userId }
    })
  }

  /* 게시글 삭제 */
  deletePost = async (userId, postId) => {
    await prisma.$transaction(async (prisma) => {
      const post = await prisma.posts.delete({
        where: { postId: +postId, UserId: +userId },
      });

      await prisma.locations.update({
        where: { locationId: post.LocationId },
        data: {
          postCount: {
            decrement: 1,
          },
        },
      });

      const findLocation = await prisma.locations.findFirst({
        where: { locationId: post.LocationId }
      })

      if (findLocation.postCount === 0) {
        await prisma.locations.delete({
          where: { locationId: post.LocationId }
        })
      }
    });

    return {
      message: "게시글을 삭제하였습니다."
    }
  }
}