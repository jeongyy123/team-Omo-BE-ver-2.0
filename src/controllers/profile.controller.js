import { ProfileService } from "../services/profile.service.js";
import { profileEditSchema } from "../validations/auth.validation.js";

export class ProfileController {
  profileService = new ProfileService();

  /** 마이페이지 회원정보 확인 API */
  getProfile = async (req, res, next) => {
    try {
      const { userId } = req.user;

      const userInfo = await this.profileService.fetchMyPageUserInfo(userId);

      return res.status(200).json({ data: userInfo });
    } catch (err) {
      next(err);
    }
  };

  /** 마이페이지 게시글 목록 조회 API */
  getMyPosts = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const pageSize = req.query.pageSize || 10;
      const lastPostId = req.query.lastPostId || null;

      const myPostsCount = await this.profileService.getUserPostsCount(userId);
      const userPosts = await this.profileService.fetchUserPosts(
        userId,
        pageSize,
        lastPostId,
      );

      return res
        .status(200)
        .json({ postsCount: myPostsCount, data: userPosts });
    } catch (err) {
      next(err);
    }
  };

  /** 마이페이지 북마크 목록 조회 API */
  getMyBookmarks = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const pageSize = req.query.pageSize || 10;
      const lastBookmarkId = req.query.lastBookmarkId || null;

      const myFavouritePlacesCount =
        await this.profileService.fetchMyBookmarksCount(userId);

      const favouritePlaces = await this.profileService.fetchMyBookmarkedPlaces(
        userId,
        pageSize,
        lastBookmarkId,
      );

      return res
        .status(200)
        .json({ bookmarkCount: myFavouritePlacesCount, data: favouritePlaces });
    } catch (err) {
      next(err);
    }
  };

  /** 마이페이지 내 정보 수정 API */
  editMyInfo = async (req, res, next) => {
    try {
      const { userId } = req.user;
      const file = req.file;

      const validation = await profileEditSchema.validateAsync(req.body);
      const { nickname, newPassword, confirmedPassword } = validation;

      await this.profileService.updateUserInfo(
        userId,
        file,
        nickname,
        newPassword,
        confirmedPassword,
      );

      return res.status(200).json({ message: "회원정보가 수정되었습니다." });
    } catch (err) {
      next(err);
    }
  };

  /** 다른 유저의 프로필 조회 API */
  viewOtherProfile = async (req, res, next) => {
    try {
      const { nickname } = req.params;

      const otherUserInfo =
        await this.profileService.getOtherUserProfile(nickname);

      return res.status(200).json({ data: otherUserInfo });
    } catch (err) {
      next(err);
    }
  };

  /** 다른 유저의 프로필에서 그 사람이 쓴 게시글 목록 조회 API*/
  viewPostsFromOtherProfile = async (req, res, next) => {
    try {
      const { nickname } = req.params;
      const pageSize = req.query.pageSize || 10;
      const lastPostId = req.query.lastPostId || null;

      const userPostsCount =
        await this.profileService.getOtherUserPostsCount(nickname);

      const userPosts = await this.profileService.fetchOtherUserPostsList(
        nickname,
        pageSize,
        lastPostId,
      );

      return res
        .status(200)
        .json({ postsCount: userPostsCount, data: userPosts });
    } catch (err) {
      next(err);
    }
  };
}
