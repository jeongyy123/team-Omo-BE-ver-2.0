import express from "express";
import UsersRouter from "./routes/users/user.router.js";
import AuthRouter from "./routes/users/auth.router.js";
import MainRouter from "./routes/main/main.router.js";
import PostsRouter from "./routes/posts/posts.router.js";
import ProfileRouter from "./routes/users/profile.router.js";
import CommentsRouter from "./routes/comments/comments.router.js";
import LocationRouter from "./routes/locations/location.router.js";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middlewares/error.middleware.js";
import session from "express-session";
// import configurePassport from "./passport/index.js";
// import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import redis from "redis";

dotenv.config();

const app = express();
const PORT = 5000;

//* Redis 연결
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true, // 반드시 설정 !!
});

// express-session을 passport 설정 전에 먼저 사용하도록 설정
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  }),
);

// Passport 설정 초기화
// configurePassport(); // configurePassport 함수 호출
// app.use(passport.initialize()); // passport 설정을 초기화
// app.use(passport.session()); // passport를 세션과 연결

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "success" });
});

app.use(cookieParser());
app.use("/api", [
  ProfileRouter,
  UsersRouter,
  MainRouter,
  PostsRouter,
  CommentsRouter,
  LocationRouter,
]);
app.use("/auth", [AuthRouter]);
app.use(ErrorMiddleware);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});
redisClient.on('connect', () => {
  console.log('Connected to Redis!');
});

redisClient.on("error", (err) => {
  console.error("레디스 클라이언트 에러", err);
});

await redisClient.connect();