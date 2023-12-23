import express from "express";
import UsersRouter from "./routes/users/user.router.js";
import UserProfileRouter from "./routes/profiles/profile.router.js";
import OauthRouter from "./routes/Oauth/auth.router.js";
import MainRouter from "./routes/main/main.router.js";
import PostsRouter from "./routes/posts/posts.router.js";
import CommentsRouter from "./routes/comments/comments.router.js";
import LocationRouter from "./routes/locations/location.router.js";
import LikeRouter from "./routes/isLike/isLike.router.js";
import BookmarkRouter from "./routes/bookmark/bookmark.router.js";
import SearchingRouter from "./routes/searching/searching.router.js";
import cookieParser from "cookie-parser";
import ErrorMiddleware from "./middlewares/error.middleware.js";
import session from "express-session";
import swaggerConfig from "./swagger/swagger.js";
import swaggerUi from "swagger-ui-express";
// import configurePassport from "./passport/index.js";
// import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();
//
const app = express();
const app2 = express();

const PORT = 3003;
const PORT2 = 3004;

app.use(morgan("dev"));
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
// configurePassport(); // configurePassport 함수 호출  // passport 불러온다.

//! express-session에 의존하므로 뒤에 위치해야 함
// app.use(passport.initialize()); // 요청 객체에 passport 설정을 심음
// app.use(passport.session()); // req.session 객체에 passport정보를 추가 저장
// passport.session()이 실행되면, 세션쿠키 정보를 바탕으로 해서 passport/index.js의 deserializeUser()가 실행하게 한다.

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig.specs));

app.get("/", (req, res) => {
  res.send("첫번째 서버");
});

app2.get("/", (req, res) => {
  res.send("두번째 서버");
});

app.use("/api", [
  UserProfileRouter,
  MainRouter,
  PostsRouter,
  CommentsRouter,
  LocationRouter,
  LikeRouter,
  BookmarkRouter,
  SearchingRouter,
]);

app.use("/auth", [OauthRouter, UsersRouter]);
app.use(ErrorMiddleware);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});

app2.listen(PORT2, (req, res) => {
  console.log(PORT2, `포트 ${PORT2}번이 열렸습니다.`);
});
