import Redis from 'ioredis';
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

// 저장 된 데이터 redis에서 가져오기
export const getChckeCache = async (req, res, next) => {
  let value = await redis.hgetall(req.key);
  if (value) {
    return res.status(200).json(value)
  } else {
    next();
  }
};

export const setCheckCache = async (key, data, ttl = 5000) => {
  try {
    redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (error) {
    return null;
  }
};

const removeCache = async (key) => {
  try {
    redis.del(key);
  } catch (error) {
    return null;
  }
}
