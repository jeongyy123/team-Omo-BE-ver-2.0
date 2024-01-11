import joi from "joi";

const createRepliesSchema = joi.object({
  content: joi.string().trim().min(1).max(1000).messages({
    "string.min": "댓글작성은 1자 이상 작성해주세요.",
    "string.max": "댓글작성은 1000자 이하로 작성해주세요.",
    "string.empty": "댓글을 작성해주세요.",
  }),
  PostId: joi.number(),
  UserId: joi.number(),
  createdAt: joi.string(),
});

export { createRepliesSchema };
