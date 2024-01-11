import { expect, jest } from '@jest/globals';
import { PostsController } from '../../../src/controllers/posts.controller.js';

const mockPostsService = {
  findAllPosts: jest.fn(),
  findPostById: jest.fn(),
  findPostByPostId: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

const mockRequest = {
  body: jest.fn(),
  params: jest.fn(),
  user: jest.fn(),
};

const mockResponse = {
  status: jest.fn(),
  json: jest.fn(),
};

const mockNext = jest.fn();

const postsController = new PostsController(mockPostsService);

describe('Posts Controller Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockResponse.status.mockReturnValue(mockResponse);
  });

  test('getPosts Method by Success', async () => {
    const getPostRequestQueryParams = {
      page: 5,
      lastSeenPage: 1,
      categoryName: 'testCategory',
      districtName: 'address',
    };

    mockRequest.query = getPostRequestQueryParams;

    const getPostsReturnValue = [
      {
        User: {
          nickname: "testNickname",
        },
        Category: {
          categoryName: "testCategory",
        },
        Location: {
          locationId: 1,
          storeName: "testStoreName",
          address: "test address",
          starAvg: 1,
          postCount: 1,
        },
        postId: 1,
        imgUrl:
          "818a74719a9a4658413e7fcec94c59a453b29627a5e51c7ecd079fa61d50701e,eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5",
        content: "test Post Content 1 test Post Content 1",
        likeCount: 0,
        commentCount: 0,
        createdAt: "2024-01-08T08:48:02.146Z",
      },
      {
        User: {
          nickname: "nickname2",
        },
        Category: {
          categoryName: "testCategory",
        },
        Location: {
          locationId: 2,
          storeName: "storeName2",
          address: "test address",
          starAvg: 1,
          postCount: 1,
        },
        postId: 2,
        imgUrl:
          "eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5,eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5",
        content: "test Post Content 2 test Post Content 2",
        likeCount: 0,
        commentCount: 0,
        createdAt: "2024-01-09T08:48:02.146Z",
      },
    ];

    mockPostsService.findAllPosts.mockReturnValue(getPostsReturnValue);

    await postsController.getPosts(mockRequest, mockResponse, mockNext);

    expect(mockPostsService.findAllPosts).toHaveBeenCalledWith(
      getPostRequestQueryParams.page,
      getPostRequestQueryParams.lastSeenPage,
      getPostRequestQueryParams.categoryName,
      getPostRequestQueryParams.districtName
    )
    expect(mockPostsService.findAllPosts).toHaveBeenCalledTimes(1);

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(getPostsReturnValue);

  });

  test('getPostById Method by Success', async () => {
    const getPostByIdRequestQueryParam = {
      postId: 1,
    };

    mockRequest.params = getPostByIdRequestQueryParam;

    const getPostByIdReturnValue = {
      postId: 1,
      content: "test Post Content test Post Content",
      createdAt: "2024-01-08T08:48:02.146Z",
      likeCount: 0,
      commentCount: 1,
      imgUrl:
        "818a74719a9a4658413e7fcec94c59a453b29627a5e51c7ecd079fa61d50701e",
      star: 1,
      User: {
        userId: 1,
        nickname: "testNickname",
        imgUrl:
          "0b2f746651bb7e903bd2c985714170b8746f0fc6d9a966ba31476e515495ebd1",
      },
      Location: {
        locationId: 1,
        address: "서울 노원구 테스트 1동",
        storeName: "testStoreName",
        latitude: "37.1111",
        longitude: "127.1111",
        postCount: 1,
        placeInfoId: "placeInfoId1",
        Category: {
          categoryId: 1,
          categoryName: "음식점",
        },
      },
      Comments: [
        {
          commentId: 1,
          content: "testComment",
          createdAt: "2024-01-08T11:25:24.337Z",
          User: {
            userId: 1,
            imgUrl:
              "0b2f746651bb7e903bd2c985714170b8746f0fc6d9a966ba31476e515495ebd1",
            nickname: "testNickname",
          },
          Replies: [
            {
              replyId: 1,
              content: "testReply",
              createdAt: "2024-01-08T11:25:43.154Z",
              User: {
                userId: 1,
                imgUrl:
                  "0b2f746651bb7e903bd2c985714170b8746f0fc6d9a966ba31476e515495ebd1",
                nickname: "testNickname",
              },
            },
          ],
        },
      ],
    };

    mockPostsService.findPostById.mockReturnValue(getPostByIdReturnValue);

    await postsController.getPostById(mockRequest, mockResponse, mockNext);

    expect(mockPostsService.findPostById).toHaveBeenCalledTimes(1);
    expect(mockPostsService.findPostById).toHaveBeenCalledWith(
      getPostByIdRequestQueryParam.postId
    );


    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(getPostByIdReturnValue);
  });

  test('getPostById Method by 잘못된 요청입니다.', async () => {
    try {
      mockRequest.params = null;

      await postsController.getPostById(mockRequest, mockResponse, mockNext);

    } catch (error) {
      expect(mockResponse.status).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      expect(mockResponse.json).toHaveBeenCalledTimes(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: "잘못된 요청입니다." });
    }
  })

  test('deletePost Method by Success', async () => {
    const deletePostRequestUserParams = {
      userId: 1
    };

    const deletePostRequestParams = {
      postId: 1
    };

    mockRequest.user = deletePostRequestUserParams;
    mockRequest.params = deletePostRequestParams;

    const deletePostReturnValue = { message: "게시글을 삭제하였습니다." };

    mockPostsService.deletePost.mockReturnValue(deletePostReturnValue);

    await postsController.deletePost(mockRequest, mockResponse, mockNext);

    expect(mockPostsService.deletePost).toHaveBeenCalledTimes(1);
    expect(mockPostsService.deletePost).toHaveBeenCalledWith(
      deletePostRequestUserParams.userId,
      deletePostRequestParams.postId
    );

    expect(mockResponse.status).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);

    expect(mockResponse.json).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(deletePostReturnValue);
  });
});