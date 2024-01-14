export class FollowingController {
  constructor(followingService) {
    this.followingService = followingService;
  }
  // 팔로우하기 
  followUser = async (req, res, next) => {
    try {

      const userFromId = req.user.userId; // 구독자

      const userToId = req.params.userId; // 구독받는 사람

      if (+userFromId === +userToId) {
        return res.status(400).json({ message: "자기 자신을 구독할 수 없습니다." })
      }

      if (!userFromId || !userToId) {
        return res.status(400).json({ message: "존재하지않은 유저입니다." })
      }

      await this.followingService.followUser(userFromId, userToId)

      return res.status(201).json({ message: "구독 완료" })
    }
    catch (error) {
      next(error)
    }

  }
  // 팔로우 취소하기 
  unFollowUser = async (req, res, next) => {
    try {
      const userFromId = req.user.userId; // 구독자

      const userToId = req.params.userId; // 구독받는 사람

      if (+userFromId === +userToId) {
        return res.status(400).json({ message: "자기 자신을 구독 취소 할 수 없습니다." })
      }

      if (!userFromId || !userToId) return res.status(400).json({ message: "존재하지않은 유저입니다." })
      await this.followingService.unFollowUser(userFromId, userToId)

      return res.status(201).json({ message: "구독 취소 완료" })
    }
    catch (error) {
      next(error)
    }
  }

  // !내가! 팔로우한 사람 보기
  getFollowingList = async (req, res, next) => {
    try {
      const userFromId = req.user.userId;

      const followingList = await this.followingService.getFollowingList(userFromId);

      return res.status(200).json(followingList)
    } catch (error) {
      next(error)
    };
  }

  // !나를! 팔로우한 사람 보기
  getFollowersList = async (req, res, next) => {
    try {
      const userFromId = req.user.userId;

      const followersList = await this.followingService.getFollowersList(userFromId);

      return res.status(200).json(followersList)
    } catch (error) {
      next(error)
    };
  }

  // !다른 사람이! !내가! 팔로우한 사람 보기 
  getOtherFollowingList = async (req, res, next) => {
    try {
      const userToId = req.params.userId;

      const OtherFollowingList = await this.followingService.getOtherFollowingList(userToId);

      return res.status(200).json(OtherFollowingList)
    } catch (error) {
      next(error)
    };
  }

  // !다른 사람이! !나를! 팔로우한 사람 보기
  getOtherFollowersList = async (req, res, next) => {
    try {
      const userToId = req.params.userId;

      const OtherFollowersList = await this.followingService.getOtherFollowersList(userToId);

      return res.status(200).json(OtherFollowersList)
    } catch (error) {
      next(error)
    };
  }

}