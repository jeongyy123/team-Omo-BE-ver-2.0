import { SearchingRepository } from '../repositories/searching.repository.js';

export class SearchingService {
  searchingRepository = new SearchingRepository();

  /* 검색 기능 (유저, 가게 이름) */
  getSearching = async (nickname, storeName) => {
    let searchedData;
    if (nickname) {

      const getSearchingByNickname = await this.searchingRepository.getSearchingByNickname(nickname);

      if (!getSearchingByNickname || getSearchingByNickname.length === 0) {
        const err = new Error(`검색하신 ${nickname} 님의 정보가 없어요.`);
        err.statusCode = 404;
        throw err;
      }

      // const seachedDataByNickname = await this.searchingRepository.getSearchingByNickname(findUsers);

      // if (!seachedDataByNickname || seachedDataByNickname.length === 0) {
      //   const err = new Error(`해당 ${nickname} 님(이) 작성한 게시글이 없어요.`);
      //   err.statusCode = 404;
      //   throw err;
      // }
      searchedData = getSearchingByNickname;
    }

    if (storeName) {
      const seachedDataByStoreName = await this.searchingRepository.getSearchingByStoreName(storeName);

      if (!seachedDataByStoreName || seachedDataByStoreName.length === 0) {
        const err = new Error(`검색하신 ${storeName} 가게 정보가 없어요.`);
        err.statusCode = 404;
        throw err;
      }
      searchedData = seachedDataByStoreName;

    }

    return searchedData;
  }
}