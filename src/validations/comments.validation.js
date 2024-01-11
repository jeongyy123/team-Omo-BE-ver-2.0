import joi from "joi";

const createCommentsSchema = joi.object({
  content: joi.string().trim().min(1).max(2000).messages({
    "string.min": "댓글작성은 1자 이상 작성해주세요.",
    "string.max": "댓글작성은 2000자 이하로 작성해주세요.",
    "string.empty": "댓글을 작성해주세요.",
  }),
  PostId: joi.number(),
  UserId: joi.number(),
  createdAt: joi.string(),
});

export { createCommentsSchema };
