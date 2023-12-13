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
import configurePassport from "./passport/index.js";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
// import redis from "redis";

dotenv.config();

const app = express();
const PORT = 5000;

//* Redis 연결
// redis[s]://[[username][:password]@][host][:port][/db-number]
// const redisClient = redis.createClient({
//   url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
//   legacyMode: true, // 반드시 설정 !!
// });

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
configurePassport(); // configurePassport 함수 호출  // passport 불러온다.

//! express-session에 의존하므로 뒤에 위치해야 함
app.use(passport.initialize()); // 요청 객체에 passport 설정을 심음
app.use(passport.session()); // req.session 객체에 passport정보를 추가 저장
// passport.session()이 실행되면, 세션쿠키 정보를 바탕으로 해서 passport/index.js의 deserializeUser()가 실행하게 한다.

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use("/auth", [UsersRouter]);

app.use("/api", [
  ProfileRouter,
  MainRouter,
  PostsRouter,
  CommentsRouter,
  LocationRouter,
]);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "success" });
});

app.use(cookieParser());

// redisClient.on('connect', () => {
//   console.info('Redis connected!');
// });

// redisClient.on('error', (err) => {
//   console.error('Redis Client Error', err);
// });

// redisClient.connect().then(); // redis v4 연결 (비동기)
// const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용

app.use(ErrorMiddleware);
app.use("/auth", [AuthRouter, UsersRouter]);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});
