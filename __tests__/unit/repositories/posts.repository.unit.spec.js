import { jest } from "@jest/globals";
import { PostsRepository } from "../../../src/repositories/posts.repository.js";

let mockPrisma = {
  $transaction: jest.fn(),
  posts: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  categories: {
    findFirst: jest.fn(),
  },
  districts: {
    findFirst: jest.fn(),
  },
  locations: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let postsRepository = new PostsRepository(mockPrisma);

describe("Posts Repository Unit Test", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("findAllPosts Method", async () => {
    const mockReturn = "findMany String";
    mockPrisma.posts.findMany.mockReturnValue(mockReturn);

    const posts = await postsRepository.findAllPosts();

    expect(posts).toBe(mockReturn);
    expect(mockPrisma.posts.findMany).toHaveBeenCalledTimes(1);
  });

  test("findPostById Method", async () => {
    const mockReturn = "findPostById String";
    mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

    const posts = await postsRepository.findPostById();

    expect(posts).toBe(mockReturn);
    expect(mockPrisma.posts.findFirst).toHaveBeenCalledTimes(1);
  });

  test("findCategory Method", async () => {
    const mockReturn = "findCategory String";
    mockPrisma.categories.findFirst.mockReturnValue(mockReturn);

    const category = await postsRepository.findCategory();

    expect(category).toBe(mockReturn);
    expect(mockPrisma.categories.findFirst).toHaveBeenCalledTimes(
      1,
    );
  });

  test("findDistrict Method", async () => {
    const mockReturn = "findDistrict String";
    const address = "findDistrict Address";
    mockPrisma.districts.findFirst.mockReturnValue(mockReturn);

    const category = await postsRepository.findDistrict(address);

    expect(category).toBe(mockReturn);
    expect(mockPrisma.districts.findFirst).toHaveBeenCalledTimes(1);
    expect(mockPrisma.districts.findFirst).toHaveBeenCalledWith({
      where: { districtName: address.split(" ")[1] },
    });
  });

  test("findLocation Method", async () => {
    const mockReturn = "findLocation String";
    const address = "findLocation Address";
    mockPrisma.locations.findFirst.mockReturnValue(mockReturn);

    const location = await postsRepository.findLocation(address);

    expect(location).toBe(mockReturn);
    expect(mockPrisma.locations.findFirst).toHaveBeenCalledTimes(1);
  });

  test("findPostByPostId Method", async () => {
    const mockReturn = "findPostByPostId String";
    mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

    const posts = await postsRepository.findPostByPostId();

    expect(posts).toBe(mockReturn);
    expect(mockPrisma.posts.findFirst).toHaveBeenCalledTimes(1);
  });
  //   const deleteReturn = { message: "게시글을 삭제하였습니다." };
  //   const updateReturn = {
  //     postId: 1,
  //     UserId: 1,
  //     CategoryId: 1,
  //     LocationId: 1,
  //     content: "test Post Content",
  //     imgUrl:
  //       "35f3c58c10fe7974e0148d01155d988d1d037afec1c74a346bdc2b4ea076f54e",
  //     likeCount: 0,
  //     commentCount: 0,
  //     star: 1,
  //     createdAt: "2024-01-08T02:28:14.681Z",
  //     updatedAt: "2024-01-08T13:54:03.671Z",
  //     address: "test address",
  //     storeName: "testStoreName1",
  //     placeInfoId: "testPlaceInfoId1",
  //     latitude: "37.1111",
  //     longitude: "127.1111",
  //     categoryName: "categoryName1",
  //   };

  //   const findFirstReturn = {}

  //   const deletePostParams = {
  //     postId: 1,
  //     userId: 1,
  //     placeInfoId: 1,
  //   }

  //   mockPrisma.posts.delete.mockReturnValue(deleteReturn)
  //   mockPrisma.posts.update.mockReturnValue(updateReturn);
  //   mockPrisma.posts.findFirst.mockReturnValue(findFirstReturn);

  //   const posts = await postsRepository.deletePost();

  //   expect(posts).toBe(mockReturn);
  //   expect(postsRepository.prisma.posts.findFirst).toHaveBeenCalledTimes(1);
  // });

  // test('updatePost Method', async () => { })

  // test('createPost Method', async () => {
  //   const mockReturn = "게시글 등록이 완료되었습니다.";
  //   mockPrisma.posts.create.mockReturnValue(mockReturn);

  //   const createLocationParams = {
  //     storeName: 'createLocationStorName',
  //     address: 'create Location Address',
  //     latitude: 'createLocationLatitude',
  //     longitude: 'createLocationLongitude',
  //     starAvg: 'createLocationLongitude',
  //     postCount: 'createLocationPostCount',
  //     placeInfoId: 'createLocationPlaceInfoId',
  //   };

  //   const createPostParams = {
  //     content: 'createPostContent',
  //     star: 'createPostStar',
  //     likeCount: 'createPosLikeCount',
  //     imgNames: 'createPostImgNames',
  //     categoryName: 'createPostCategoryName',
  //     address: 'create Post Address',
  //     latitude: 'createPostLatitude',
  //     longitude: 'createPostLongitude',
  //     placeInfoId: 'createPostPlaceInfoId',
  //   };

  //   const createLocationData = await postsRepository.createPost(
  //     createLocationParams.content,
  //     createLocationParams.star,
  //     createLocationParams.likeCount,
  //     createLocationParams.imgUrl,
  //     createLocationParams.categoryName,
  //     createLocationParams.address,
  //     createLocationParams.latitude,
  //     createLocationParams.longitude,
  //     createLocationParams.placeInfoId
  //   );

  //   const createPostData = await postsRepository.createPost(
  //     createPostParams.content,
  //     createPostParams.star,
  //     createPostParams.likeCount,
  //     createPostParams.imgUrl,
  //     createPostParams.categoryName,
  //     createPostParams.address,
  //     createPostParams.latitude,
  //     createPostParams.longitude,
  //     createPostParams.placeInfoId
  //   );

  //   const createData = { createLocationData, createPostData }

  //   expect(createData).toEqual(mockReturn);
  //   expect(mockPrisma.posts.create).toHaveBeenCalledTimes(1);
  //   expect(mockPrisma.posts.create).toHaveBeenCalledWith({
  //     data: createPostData,
  //   })
  //   expect(mockPrisma.locations.create).toHaveBeenCalledTimes(1);
  //   expect(mockPrisma.locations.create).toHaveBeenCalledWith({
  //     data: createLocationData,
  //   })
  // });
});
