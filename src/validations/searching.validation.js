import joi from "joi";

const searchingSchema = joi.object({
  nickname: joi.string().trim().min(1).messages({
    "string.min": "nickname를 1자 이상으로 작성해주세요.",
    "string.empty": "nickname를 입력해주세요.",
  }),
  storeName: joi.string().trim().min(1).messages({
    "string.min": "storeName을 1자 이상으로 작성해주세요.",
    "string.empty": "storeName을 입력해주세요.",
  }),
});

export { searchingSchema };
