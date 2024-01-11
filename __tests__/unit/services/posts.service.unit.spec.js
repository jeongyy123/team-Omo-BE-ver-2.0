import { beforeEach, describe, expect, jest } from "@jest/globals";
import { PostsService } from "../../../src/services/posts.service.js";

let mockPostRepository = {
  findAllPosts: jest.fn(),
  findPostById: jest.fn(),
  createPost: jest.fn(),
  findCategory: jest.fn(),
  findDistrict: jest.fn(),
  findLocation: jest.fn(),
  findPostByPostId: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

let postsService = new PostsService(mockPostRepository);

describe("Posts Servcie Unit Test", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("updatePost Method", async () => {
    const samplePosts = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "test Post Content 1 test Post Content 1",
      imgUrl:
        "35f3c58c10fe7974e0148d01155d988d1d037afec1c74a346bdc2b4ea076f54e",
      likeCount: 0,
      commentCount: 0,
      star: 1,
      createdAt: "2024-01-08T02:28:14.681Z",
      updatedAt: "2024-01-08T13:54:03.671Z",
      address: "test address",
      storeName: "testStoreName1",
      placeInfoId: "testPlaceInfoId1",
      latitude: "37.1111",
      longitude: "127.1111",
      categoryName: "categoryName1",
    };
    const mockReturn = { message: "게시물을 수정하였습니다." };

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);
    mockPostRepository.updatePost.mockReturnValue(mockReturn);

    const updatePost = await postsService.updatePost(
      1,
      1,
      "test address",
      "test Post Content 1 test Post Content 1",
      1,
      "testStoreName1",
      "testPlaceInfoId1",
      "37.1111",
      "127.1111",
      "categoryName1",
    );

    expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
    expect(mockPostRepository.findPostByPostId).toHaveBeenCalledWith(
      samplePosts.postId,
    );

    expect(mockPostRepository.updatePost).toHaveBeenCalledTimes(1);

    expect(mockPostRepository.updatePost).toHaveBeenCalledWith(
      samplePosts.postId,
      samplePosts.UserId,
      samplePosts.address,
      samplePosts.content,
      samplePosts.star,
      samplePosts.storeName,
      samplePosts.placeInfoId,
      samplePosts.latitude,
      samplePosts.longitude,
      samplePosts.categoryName,
    );

    expect(updatePost).toEqual(mockReturn);
  });

  test("updatePost Method By 존재하지않는 게시글입니다.", async () => {
    const samplePosts = null;

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);

    try {
      await postsService.deletePost(123123, 123123);
    } catch (error) {
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledWith(123123);

      expect(mockPostRepository.updatePost).toHaveBeenCalledTimes(0);

      expect(error.message).toEqual("존재하지않는 게시글입니다.");
    }
  });

  test("updatePost Method By 수정할 권한이 존재하지 않습니다.", async () => {
    const samplePosts = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "test Post Content",
      imgUrl:
        "eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5",
      likeCount: 1,
      commentCount: 1,
      star: 1,
      createdAt: "2024-01-09T08:48:02.146Z",
      updatedAt: "2024-01-09T08:48:02.146Z",
    };

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);

    try {
      await postsService.updatePost(
        12,
        11,
        "서울시 노원구 테스트 1동",
        "test Post Content",
        1,
        "testStoreName",
        "testPlaceInfoId1",
        "37.1111",
        "127.1111",
        "categoryName1",
      );
    } catch (error) {
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledWith(11);

      expect(mockPostRepository.updatePost).toHaveBeenCalledTimes(0);

      expect(error.message).toEqual("수정할 권한이 존재하지 않습니다.");
    }
  });

  test("findAllPosts Method", async () => {
    const samplePosts = [
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
          address: "서울 노원구 테스트 1동",
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
          categoryName: "categoryName2",
        },
        Location: {
          locationId: 2,
          storeName: "storeName2",
          address: "서울 노원구 테스트 2동",
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

    mockPostRepository.findAllPosts.mockReturnValue(samplePosts);
    const allPosts = await postsService.findAllPosts();

    expect(allPosts).toEqual(samplePosts);
    expect(mockPostRepository.findAllPosts).toHaveBeenCalledTimes(1);
  });

  test("findPostById Method", async () => {
    const samplePosts = {
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

    mockPostRepository.findPostById.mockReturnValue(samplePosts);
    const allPosts = await postsService.findPostById();

    expect(allPosts).toEqual(samplePosts);

    expect(mockPostRepository.findPostById).toHaveBeenCalledTimes(1);
  });

  test("findPostByPostId Method", async () => {
    const samplePosts = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "test Post Content 2 test Post Content 2",
      imgUrl:
        "eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5,eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5",
      likeCount: 1,
      commentCount: 1,
      star: 1,
      createdAt: "2024-01-09T08:48:02.146Z",
      updatedAt: "2024-01-09T08:48:02.146Z",
    };

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);
    const allPosts = await postsService.findPostByPostId();

    expect(allPosts).toEqual(samplePosts);
    expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
  });

  test("deletePost Method", async () => {
    const samplePosts = {
      postId: 1,
      UserId: 1,
      CategoryId: 1,
      LocationId: 1,
      content: "test Post Content 2 test Post Content 2",
      imgUrl:
        "eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5,eb4e64bdd9cff142c02bd567ec915a5de1f304c20e348fb25d0bf6aa67da9bf5",
      likeCount: 1,
      commentCount: 1,
      star: 1,
      createdAt: "2024-01-09T08:48:02.146Z",
      updatedAt: "2024-01-09T08:48:02.146Z",
    };
    const mockReturn = { message: "게시글을 삭제하였습니다." };

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);
    mockPostRepository.deletePost.mockReturnValue(mockReturn);

    const deletedPost = await postsService.deletePost(1, 1);

    expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
    expect(mockPostRepository.findPostByPostId).toHaveBeenCalledWith(
      samplePosts.postId,
    );

    expect(mockPostRepository.deletePost).toHaveBeenCalledTimes(1);
    expect(mockPostRepository.deletePost).toHaveBeenCalledWith(
      samplePosts.UserId,
      samplePosts.postId,
    );

    expect(deletedPost).toEqual(mockReturn);
  });

  test("deletePost Method By 존재하지않는 게시글입니다.", async () => {
    const samplePosts = null;

    mockPostRepository.findPostByPostId.mockReturnValue(samplePosts);

    try {
      await postsService.deletePost(123123, 123123);
    } catch (error) {
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledTimes(1);
      expect(mockPostRepository.findPostByPostId).toHaveBeenCalledWith(123123);

      expect(mockPostRepository.deletePost).toHaveBeenCalledTimes(0);

      expect(error.message).toEqual("존재하지않는 게시글입니다.");
    }
  });
});
