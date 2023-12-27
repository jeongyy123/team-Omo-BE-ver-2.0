import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = redis.createClient({
  // Redis 서버의 포트 번호를 가져와서 Redis 클라이언트가 해당 포트에 연결할 수 있도록 한다
  port: process.env.REDIS_PORT, // Redis 서버에 연결하기 위한 포트 번호
  password: process.env.REDIS_PASSWORD,
  // host: "localhost", // EC2 인스턴스의 퍼블릭 IP 주소
});

redisClient.on("connect", () => {
  console.log("redis connection success");
});

redisClient.on("ready", () => {
  console.log("Redis is ready to use");
});

redisClient.on("error", () => {
  console.log("redis connection error");
  console.log(error);
});

redisClient.on("end", () => {
  console.log("Redis disconnected successfully");
});

redisClient.connect();

export default redisClient;
