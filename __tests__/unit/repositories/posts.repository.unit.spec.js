// import { jest } from '@jest/globals';
// import { PostsRepository } from '../../../src/repositories/posts.repository.js'

// //findAllPosts findPostById createPost findCategory findDistrict updatePost findPostByPostId deletePost
// let mockPrisma = {
//   posts: {
//     findFirst: jest.fn(),
//     findMany: jest.fn(),
//     create: jest.fn(),
//     aggregate: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//   }
// }

// let postsRepository = new PostsRepository(mockPrisma);

// describe('Posts Repository Unit Test', () => {

//   beforeEach(() => {
//     jest.resetAllMocks();
//   })

//   test('findAllPosts Method', async (categoryName, districtName) => {
//     const mockReturn = 'findFirst String';
//     mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

//     // postsRepository의 메소드 실행
//     const postsByCategoryName = await postsRepository.findAllPosts(categoryName);
//     const postsByDistrictName = await postsRepository.findAllPosts(districtName);

//     //findAllPosts의 반환값은 findAllPosts의 반환값과 같음.
//     expect(postsByCategoryName).toBe(mockReturn);
//     expect(postsByDistrictName).toBe(mockReturn);

//     expect(postsRepository.prisma.posts.findFirst).toHaveBeebCalledTimes(2);
//   });


//   test('findAllPosts Method', async () => {
//     const mockReturn = 'findMany String';
//     mockPrisma.posts.findMany.mockReturnValue(mockReturn);

//     // postsRepository의 메소드 실행
//     const posts = await postsRepository.findAllPosts();

//     //findAllPosts의 반환값은 findAllPosts의 반환값과 같음.
//     expect(posts).toBe(mockReturn);

//     expect(postsRepository.prisma.posts.findMany).toHaveBeebCalledTimes(1);
//   });


//   test('findPostById Method', async () => {
//     const mockReturn = 'findPostById String';
//     mockPrisma.posts.findFirst.mockReturnValue(mockReturn);

//     // postsRepository의 메소드 실행
//     const posts = await postsRepository.findPostById();

//     //findAllPosts의 반환값은 findAllPosts의 반환값과 같음.
//     expect(posts).toBe(mockReturn);

//     expect(postsRepository.prisma.posts.findFirst).toHaveBeebCalledTimes(1);
//   });



//   test('createPost Method', async () => {

//   });

// });