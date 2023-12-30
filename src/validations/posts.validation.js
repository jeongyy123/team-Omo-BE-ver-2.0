import Joi from "joi";

const createPostsSchema = Joi.object({
  content: Joi.string().min(10).max(2000).messages({
    "string.min": "content를 10자 이상으로 작성해주세요.",
    "string.max": "content를 2000자 이하으로 작성해주세요.",
    "string.empty": "content를 입력해주세요.",
  }),
  categoryName: Joi.string().valid("음식점", "카페", "기타").messages({
    "string.empty": "categoryName를 입력해주세요.",
    "any.only": "음식점, 카페, 기타만 선택해주세요.",
  }),
  address: Joi.string().messages({
    "any.only": "주소를 선택해주세요.",
  }),
  likeCount: Joi.string().messages({
    "any.only": "주소를 선택해주세요.",
  }),
  storeName: Joi.string().messages({
    "any.only": "가게를 선택해주세요.",
  }),
  latitude: Joi.string().messages({
    "any.only": "위도를 입력해주세요.",
  }),
  longitude: Joi.string().messages({
    "any.only": "경도를 입력해주세요.",
  }),
  star: Joi.number().min(1).max(5).messages({
    "any.only": "별점을 입력해주세요.",
  }),
  placeInfoId: Joi.string()
});

const editPostsSchema = Joi.object({
  content: Joi.string().min(10).max(2000).messages({
    "string.min": "content를 10자 이상으로 작성해주세요.",
    "string.max": "content를 2000자 이하으로 작성해주세요.",
  }),
  address: Joi.string().messages({
    "any.only": "주소를 선택해주세요.",
    "string.empty": "주소를 선택해주세요."
  }),
  storeName: Joi.string().messages({
    "any.only": "가게를 선택해주세요.",
    "string.empty": "가게를 선택해주세요"
  }),
  star: Joi.number().min(1).max(5).integer().messages({
    "any.only": "별점을 입력해주세요.",
    'number.min': "별점을 1점 이상으로 입력해주세요.",
    'number.max': "별점을 5점 이하로 입력해주세요.",
    'number.integer': '별점을 정수로만 입력해주세요.'
  }),
  placeInfoId: Joi.string().messages({
    "string.empty": "placeInfoId을 입력해주세요."
  }),
  categoryName: Joi.string().valid("음식점", "카페", "기타").messages({
    "string.empty": "categoryName를 입력해주세요.",
    "any.only": "음식점, 카페, 기타만 선택해주세요.",
  }),
  latitude: Joi.string().messages({
    "any.only": "위도를 입력해주세요.",
    "string.empty": "위도를 입력해주세요."
  }),
  longitude: Joi.string().messages({
    "any.only": "경도를 입력해주세요.",
    "string.empty": "경도를 입력해주세요."
  }),
});

export { createPostsSchema, editPostsSchema };
