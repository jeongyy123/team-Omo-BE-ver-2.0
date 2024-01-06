import { prisma } from "../utils/prisma/index.js";

export class ProfileRepositoty {
  fetchMyPageUserInfo = async (userId) => {
    const userInfo = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
      select: {
        email: true,
        nickname: true,
        imgUrl: true,
      },
    });

    return userInfo;
  };

  getUserPostsCount = async (userId) => {
    const myPostsCount = await prisma.posts.count({
      where: {
        UserId: +userId,
      },
    });

    return myPostsCount;
  };

  fetchUserPosts = async (userId, pageSize, lastPostId) => {
    const userPosts = await prisma.posts.findMany({
      where: {
        UserId: +userId,
        // 이전 페이지의 마지막 lastPostId보다 큰 값일 경우에만 추가 필터링
        postId: lastPostId ? { gt: +lastPostId } : undefined,
      },
      // 내 게시글
      select: {
        postId: true,
        UserId: true,
        User: {
          select: {
            nickname: true, // 현재 유저 네임!
          },
        },
        imgUrl: true,
        content: true,
        likeCount: true,
        commentCount: true, // 각 게시글의 댓글 갯수
        createdAt: true,
        updatedAt: true,
        Comments: {
          // 게시글에 있는 댓글
          select: {
            UserId: true,
            PostId: true,
            content: true,
            createdAt: true,
            User: {
              select: {
                nickname: true, // 댓글 작성자의 닉네임
                imgUrl: true, // 댓글 작성자의 프로필 사진
              },
            },
          },
        },
        Location: {
          select: {
            address: true,
          },
        },
      },
      take: +pageSize, // 가져올 데이터의 갯수
      orderBy: {
        postId: "desc", // 커서 기반 정렬
      },
    });

    return userPosts;
  };

  fetchMyBookmarksCount = async (userId) => {
    const myFavouritePlacesCount = await prisma.bookmark.count({
      where: {
        UserId: +userId,
      },
    });

    return myFavouritePlacesCount;
  };

  fetchMyBookmarkedPlaces = async (userId, pageSize, lastBookmarkId) => {
    const favouritePlaces = await prisma.bookmark.findMany({
      where: {
        UserId: +userId,
        // 이전 페이지의 마지막 bookmarkId보다 큰 값일 경우에만 추가 필터링
        bookmarkId: lastBookmarkId ? { gt: +lastBookmarkId } : undefined,
      },
      select: {
        bookmarkId: true,
        // createdAt: true,
        Location: {
          select: {
            locationId: true,
            storeName: true,
            address: true,
            starAvg: true,
            postCount: true,
            placeInfoId: true,
            latitude: true,
            longitude: true,
            Posts: {
              select: {
                LocationId: true,
                // likeCount: true,
                imgUrl: true,
              },
              orderBy: {
                createdAt: "asc", // 이 장소에 대한 게시글을 맨 처음 올린사람의 이미지를 가져옴
              },
              take: 1, // 첫번째 게시글 1개만 가져오기, 여러개불러오면 낭비가 될수있음
            },
            Category: {
              select: {
                categoryName: true,
              },
            },
          },
        }, // Location
      },
      take: +pageSize, // 가져올 데이터의 갯수
      orderBy: {
        createdAt: "desc",
      },
    });

    return favouritePlaces;
  };

  updateProfileImage = async (userId, imageName) => {
    const updateImageUrl = await prisma.users.update({
      where: {
        userId: +userId,
      },
      data: {
        imgUrl: imageName,
      },
    });

    return updateImageUrl;
  };

  checkIfUserExists = async (userId) => {
    const user = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
    });

    return user;
  };

  updateUserPassword = async (userId, hashedPassword) => {
    const getNewPassword = await prisma.users.update({
      where: {
        userId: +userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return getNewPassword;
  };

  updateUserNickname = async (userId, nickname) => {
    const newNickname = await prisma.users.update({
      where: {
        userId: +userId,
      },
      data: {
        nickname: nickname,
      },
    });

    return newNickname;
  };

  getOtherUserProfile = async (nickname) => {
    const otherUserInfo = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
      select: {
        userId: true,
        email: true,
        nickname: true,
        imgUrl: true,
      },
    });

    return otherUserInfo;
  };

  // 유저 닉네임으로 해당 유저의 userId 가져오기
  findUserId = async (nickname) => {
    const findUser = await prisma.users.findFirst({
      where: {
        nickname: nickname,
      },
      select: {
        userId: true,
      },
    });

    return findUser;
  };

  getOtherUserPostsCount = async (findUserId) => {
    // 해당 유저가 작성한 게시글의 갯수
    const userPostsCount = await prisma.posts.count({
      where: {
        UserId: findUserId,
      },
    });

    return userPostsCount;
  };

  fetchOtherUserPostsList = async (foundUserId, pageSize, lastPostId) => {
    const userPosts = await prisma.posts.findMany({
      where: {
        UserId: +foundUserId,
        // 이전 페이지의 마지막 lastPostId보다 큰 값일 경우에만 추가 필터링
        postId: lastPostId ? { gt: +lastPostId } : undefined,
      },
      // 내 게시글
      select: {
        postId: true,
        UserId: true,
        User: {
          select: {
            nickname: true, // 현재 유저 네임!
          },
        },
        imgUrl: true,
        content: true,
        likeCount: true,
        commentCount: true, // 각 게시글의 댓글 갯수
        createdAt: true,
        updatedAt: true,
        Comments: {
          // 게시글에 있는 댓글
          select: {
            UserId: true,
            PostId: true,
            content: true,
            createdAt: true,
            User: {
              select: {
                nickname: true,
                imgUrl: true,
              },
            },
          },
        },
        Location: {
          select: {
            address: true,
          },
        },
      },
      take: +pageSize,
      orderBy: {
        postId: "desc",
      },
    });

    return userPosts;
  };
}
