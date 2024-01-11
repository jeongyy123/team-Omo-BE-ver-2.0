// import { jest } from "@jest/globals";
// import { PostsRepository } from "../../../src/repositories/posts.repository.js";

// let mockPrisma = {
//   $transaction: jest.fn(),
//   posts: {
//     findFirst: jest.fn(),
//     findMany: jest.fn(),
//     create: jest.fn(),
//     aggregate: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//     aggregate: jest.fn(),
//   },
//   categories: {
//     findFirst: jest.fn(),
//   },
//   districts: {
//     findFirst: jest.fn(),
//   },
//   locations: {
//     findFirst: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//   },
// };

// let postsRepository = new PostsRepository(mockPrisma);

// describe("Posts Repository Unit Test", () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   test("findAllPosts Method", async () => {
//     const mockReturn = "findMany String";
//     mockPrisma.posts.findMany.mockReturnValue(mockReturn);

//     const posts = await postsRepository.findAllPosts();

//     expect(posts).toBe(mockReturn);
//     expect(mockPrisma.posts.findMany).toHaveBeenCalledTimes(1);
//   });

//   test("findPostById Method", async () => {
//     const mockReturn = "findPostById String";
//     mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

//     const posts = await postsRepository.findPostById();

//     expect(posts).toBe(mockReturn);
//     expect(mockPrisma.posts.findFirst).toHaveBeenCalledTimes(1);
//   });

//   test("findCategory Method", async () => {
//     const mockReturn = "findCategory String";
//     mockPrisma.categories.findFirst.mockReturnValue(mockReturn);

//     const category = await postsRepository.findCategory();

//     expect(category).toBe(mockReturn);
//     expect(mockPrisma.categories.findFirst).toHaveBeenCalledTimes(
//       1,
//     );
//   });

//   test("findDistrict Method", async () => {
//     const mockReturn = "findDistrict String";
//     const address = "findDistrict Address";
//     mockPrisma.districts.findFirst.mockReturnValue(mockReturn);

//     const category = await postsRepository.findDistrict(address);

//     expect(category).toBe(mockReturn);
//     expect(mockPrisma.districts.findFirst).toHaveBeenCalledTimes(1);
//     expect(mockPrisma.districts.findFirst).toHaveBeenCalledWith({
//       where: { districtName: address.split(" ")[1] },
//     });
//   });

//   test("findLocation Method", async () => {
//     const mockReturn = "findLocation String";
//     const address = "findLocation Address";
//     mockPrisma.locations.findFirst.mockReturnValue(mockReturn);

//     const location = await postsRepository.findLocation(address);

//     expect(location).toBe(mockReturn);
//     expect(mockPrisma.locations.findFirst).toHaveBeenCalledTimes(1);
//   });

//   test("findPostByPostId Method", async () => {
//     const mockReturn = "findPostByPostId String";
//     mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

//     const posts = await postsRepository.findPostByPostId();

//     expect(posts).toBe(mockReturn);
//     expect(mockPrisma.posts.findFirst).toHaveBeenCalledTimes(1);
//   });
// });
