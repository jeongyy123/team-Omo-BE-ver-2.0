import { getSearchingProfile } from '../utils/getImageS3.js';

export class FollowingService {
  constructor(followingRepository) {
    this.followingRepository = followingRepository;
  }
  // userFromId = 구독자, userToId = 구독받는 사람
  followUser = async (userFromId, userToId) => {

    const user = await this.followingRepository.findUserByUserFromId(userToId);

    if (!user) {
      const err = new Error("구독할 유저가 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    const findFollowers = await this.followingRepository.findFollowers(userFromId, userToId);

    if (findFollowers) {
      const err = new Error("이미 구독한 유저입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.followingRepository.createFollower(userFromId, userToId);

    return { message: "구독 완료" }
  }

  unFollowUser = async (userFromId, userToId) => {

    const user = await this.followingRepository.findUserByUserFromId(userToId);

    if (!user) {
      const err = new Error("구독 취소할 유저가 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    const findFollowers = await this.followingRepository.findFollowers(userFromId, userToId);

    if (!findFollowers) {
      const err = new Error("이미 구독 취소한 유저입니다.");
      err.statusCode = 400;
      throw err;
    }

    await this.followingRepository.deleteFollower(findFollowers);

    return { message: "구독 취소 완료" }
  }

  // !내가! 팔로우한 사람 보기
  getFollowingList = async (userFromId) => {
    const followingList = await this.followingRepository.getFollowingList(userFromId);

    if (!followingList || followingList.length === 0) {
      const err = new Error("내가 팔로우한 사람이 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    await getSearchingProfile(followingList);
    return followingList;
  }

  // !나를! 팔로우한 사람 보기
  getFollowersList = async (userFromId) => {
    const followersList = await this.followingRepository.getFollowersList(userFromId);

    if (!followersList || followersList.length === 0) {
      const err = new Error("나를 팔로우한 사람이 없습니다.");
      err.statusCode = 404;
      throw err;
    }

    await getSearchingProfile(followersList);

    return followersList;
  }

  // !다른 사람이! !내가! 팔로우한 사람 보기 
  getOtherFollowingList = async (userToId) => {
    const user = await this.followingRepository.findUserByUserFromId(userToId);

    const OtherFollowingList = await this.followingRepository.getFollowingList(userToId);

    if (!OtherFollowingList || OtherFollowingList.length === 0) {
      const err = new Error(`${user.nickname}님이 팔로우한 사람이 없습니다.`);
      err.statusCode = 404;
      throw err;
    }
    await getSearchingProfile(OtherFollowingList);

    return OtherFollowingList;
  }

  // !다른 사람이! !나를! 팔로우한 사람 보기
  getOtherFollowersList = async (userToId) => {
    const user = await this.followingRepository.findUserByUserFromId(userToId);

    const OtherFollowersList = await this.followingRepository.getFollowersList(userToId);

    if (!OtherFollowersList || OtherFollowersList.length === 0) {
      const err = new Error(`${user.nickname}님을 팔로우한 사람이 없습니다.`);
      err.statusCode = 404;
      throw err;
    }

    await getSearchingProfile(OtherFollowersList);

    return OtherFollowersList;
  }
}