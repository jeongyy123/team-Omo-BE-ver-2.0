import { jest } from "@jest/globals";
import { PostsRepository } from "../../../src/repositories/posts.repository.js";

//findAllPosts findPostById createPost findCategory findDistrict updatePost findPostByPostId deletePost
let mockPrisma = {
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
    // 기대값
    const mockReturn = "findMany String";
    mockPrisma.posts.findMany.mockReturnValue(mockReturn);

    // 검증값
    const posts = await postsRepository.findAllPosts();

    // 검증값과 기대값 비교
    expect(posts).toBe(mockReturn);
    expect(postsRepository.prisma.posts.findMany).toHaveBeenCalledTimes(1);
  });

  test("findPostById Method", async () => {
    const mockReturn = "findPostById String";
    mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

    const posts = await postsRepository.findPostById();

    expect(posts).toBe(mockReturn);
    expect(postsRepository.prisma.posts.findFirst).toHaveBeenCalledTimes(1);
  });

  test("findCategory Method", async () => {
    const mockReturn = "findCategory String";
    mockPrisma.categories.findFirst.mockReturnValue(mockReturn);

    const category = await postsRepository.findCategory();

    expect(category).toBe(mockReturn);
    expect(postsRepository.prisma.categories.findFirst).toHaveBeenCalledTimes(
      1,
    );
  });

  test("findDistrict Method", async () => {
    const mockReturn = "findDistrict String";
    const address = "findDistrict Address";
    mockPrisma.districts.findFirst.mockReturnValue(mockReturn);

    const category = await postsRepository.findDistrict(address);

    expect(category).toBe(mockReturn);
    expect(postsRepository.prisma.districts.findFirst).toHaveBeenCalledTimes(1);
    expect(postsRepository.prisma.districts.findFirst).toHaveBeenCalledWith({
      // 따로 연산이 필요한것만 별도로 상수가 필요한가보다
      where: { districtName: address.split(" ")[1] },
    });
  });

  test("findLocation Method", async () => {
    const mockReturn = "findLocation String";
    const address = "findLocation Address";
    mockPrisma.locations.findFirst.mockReturnValue(mockReturn);

    const location = await postsRepository.findLocation(address);

    expect(location).toBe(mockReturn);
    expect(postsRepository.prisma.locations.findFirst).toHaveBeenCalledTimes(1);
  });

  test("findPostByPostId Method", async () => {
    const mockReturn = "findPostByPostId String";
    mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

    const posts = await postsRepository.findPostByPostId();

    expect(posts).toBe(mockReturn);
    expect(postsRepository.prisma.posts.findFirst).toHaveBeenCalledTimes(1);
  });

  /* create, update, delete 아직 안함 */

  // test('deletePost Method', async () => {
  //   const mockReturn = 'deletePost String';
  //   mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

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
