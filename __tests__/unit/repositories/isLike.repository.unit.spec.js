import { beforeEach, describe, expect, jest } from '@jest/globals';
import { IsLikeRepository } from '../../../src/repositories/isLike.repository.js';

let mockPrisma = {
  likes: {
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  posts: {
    findFirst: jest.fn(),
    update: jest.fn()
  },
};

let isLikeRepository = new IsLikeRepository(mockPrisma);

describe('IsLike Repository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createLike Method', async () => {
    const updateParams = {
      postId: 1,
    };

    const updateBodyParams = {
      likeCount: { increment: 1 }
    };

    const updateReturn = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "testContent",
      imgUrl: "testImgUrl",
      likeCount: 0,
      commentCount: 1,
      star: 1,
      createdAt: "2024-01-08T02:28:14.681Z",
      updatedAt: "2024-01-08T02:28:14.681Z"
    }

    const craeteParams = {
      PostId: 1,
      UserId: 1
    }

    const createLikeReturn = { message: "좋아요" };

    mockPrisma.posts.update.mockReturnValue(updateReturn)
    mockPrisma.likes.create.mockReturnValue(createLikeReturn);

    const createLikeData = await isLikeRepository.createLike(
      craeteParams.PostId, craeteParams.UserId
    );

    expect(createLikeData).toEqual(createLikeReturn);
    expect(mockPrisma.posts.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.posts.update).toHaveBeenCalledWith({
      data: updateBodyParams,
      where: updateParams
    });

    expect(mockPrisma.likes.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.likes.create).toHaveBeenCalledWith({
      data: craeteParams
    });


  });

  test('deleteLike Method', async () => {
    const findFirstReturn = {
      likeId: 1,
      UserId: 1,
      PostId: 1
    }

    const updateReturn = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "testContent",
      imgUrl: "testImgUrl",
      likeCount: 0,
      commentCount: 1,
      star: 1,
      createdAt: "2024-01-08T02:28:14.681Z",
      updatedAt: "2024-01-08T02:28:14.681Z"
    }

    const deleteReturn = { message: "좋아요 취소" };

    const findFirstParams = {
      PostId: 1,
      UserId: 1
    };

    const updateParams = {
      postId: 1,
    };
    const updateBodyParams = {
      likeCount: { decrement: 1 }
    };

    const deleteLikeParams = {
      postId: 1,
      userId: 1,
    };

    const deleteParams = {
      likeId: 1
    };

    mockPrisma.likes.findFirst.mockReturnValue(findFirstReturn);
    mockPrisma.posts.update.mockReturnValue(updateReturn);
    mockPrisma.likes.delete.mockReturnValue(deleteReturn);

    const deleteLikeData = await isLikeRepository.deleteLike(deleteLikeParams.postId, deleteLikeParams.userId)

    expect(mockPrisma.likes.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.likes.findFirst).toHaveBeenCalledWith({
      where: findFirstParams
    })

    expect(mockPrisma.posts.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.posts.update).toHaveBeenCalledWith({
      data: updateBodyParams,
      where: updateParams
    })

    expect(deleteLikeData).toEqual(deleteReturn);
    expect(mockPrisma.likes.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.likes.delete).toHaveBeenCalledWith({
      where: deleteParams
    })
  });

  test('findPostByPostId Method', async () => {
    const findPostReturn = {
      postId: 1,
      UserId: 1,
      LocationId: 1,
      title: 'testTitle',
      content: 'testContent',
      likeCount: 1,
      createdAt: '2021-08-25T00:00:00.000Z',
      updatedAt: '2021-08-25T00:00:00.000Z',
    };
    const findPostParams = {
      postId: 1
    };

    mockPrisma.posts.findFirst.mockReturnValue(findPostReturn);

    const likedPost = await isLikeRepository.findPostByPostId(1);

    expect(mockPrisma.posts.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.posts.findFirst).toHaveBeenCalledWith({
      where: findPostParams
    });
    expect(likedPost).toEqual(findPostReturn);
  });

  test('findLikeByPostIdAndUserId Method', async () => {
    const findLikeReturn = {
      likeId: 1,
      PostId: 1,
      UserId: 1,
    };

    const findLikeParams = {
      PostId: 1,
      UserId: 1,
    };

    mockPrisma.likes.findFirst.mockReturnValue(findLikeReturn);

    const like = await isLikeRepository.findLikeByPostIdAndUserId(1, 1);

    expect(mockPrisma.likes.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.likes.findFirst).toHaveBeenCalledWith({
      where: findLikeParams
    });
    expect(like).toEqual(findLikeReturn);
  });

  test('getLikedPostsByUser Method', async () => {
    const getLikedPostsReturn = {
      likeId: 1,
      PostId: 1,
      UserId: 1,
      Post: {
        Location: {
          locationId: 1
        }
      }
    };

    const getLikedPostsByUserParams = {
      UserId: 1,
    };

    mockPrisma.likes.findMany.mockReturnValue(getLikedPostsReturn);

    const likeData = await isLikeRepository.getLikedPostsByUser(getLikedPostsByUserParams.UserId);

    expect(mockPrisma.likes.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.likes.findMany).toHaveBeenCalledWith({
      select: {
        likeId: true,
        PostId: true,
        UserId: true,
        Post: {
          select: {
            Location: {
              select: { locationId: true },
            },
          },
        },
      },
      where: getLikedPostsByUserParams,
    });

    expect(likeData).toEqual(getLikedPostsReturn);
  });
})