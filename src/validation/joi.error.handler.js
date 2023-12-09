import Joi from "joi";

const registerSchema = Joi.object({
  nickname: Joi.string().alphanum().min(1).max(30).required(),
  // 입력된 문자열이 이메일 형식에 부합하는지 확인
  email: Joi.string().email().required(),
  // 문자열이 알파벳 (a-z, A-Z) 및 숫자(0-9)로만 이루어져 있는지 확인
  password: Joi.string().alphanum().min(6).required(),
  // confirmedPassword 필드의 값은 password 필드의 값과 일치해야 한다
  confirmedPassword: Joi.ref("password"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().alphanum().min(6).required(),
});

const profileEditSchema = Joi.object({
  nickname: Joi.string().alphanum().min(1).max(30),
  password: Joi.string().alphanum().min(6),
  confirmedPassword: Joi.ref("password"),
});

export { registerSchema, loginSchema, profileEditSchema };
