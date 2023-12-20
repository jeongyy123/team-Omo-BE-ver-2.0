import joi from "joi";

const createPosts = joi.object({
  content: joi.string().min(10).max(2000).messages({
    "string.min": "content를 10자 이상으로 작성해주세요.",
    "string.max": "content를 2000자 이하으로 작성해주세요.",
    "string.empty": "content를 입력해주세요.",
  }),
  categoryName: joi.string().valid("음식점", "카페", "기타").messages({
    "string.empty": "categoryName를 입력해주세요.",
    "any.only": "음식점, 카페, 기타만 선택해주세요.",
  }),
  address: joi.string().messages({
    "any.only": "주소를 선택해주세요.",
    "string.trim": "빈 칸 없이 작성해주세요.",
  }),
  likeCount: joi.string().messages({
    "any.only": "주소를 선택해주세요.",
  }),
  storeName: joi.string().messages({
    "any.only": "가게를 선택해주세요.",
  }),
  latitude: joi.string().messages({
    "any.only": "위도를 입력해주세요.",
  }),
  longitude: joi.string().messages({
    "any.only": "경도를 입력해주세요.",
  }),
  star: joi.number().min(1).max(5).messages({
    "any.only": "별점을 입력해주세요.",
  })
}).unknown();

export { createPosts };
