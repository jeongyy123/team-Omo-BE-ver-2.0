import express from "express";
import UsersRouter from "./routes/users/user.router.js";
import UserProfileRouter from "./routes/profiles/profile.router.js";
import KakaoRouter from "./routes/OAuth/kakao.router.js";
import MainRouter from "./routes/main/main.router.js";
import PostsRouter from "./routes/posts/posts.router.js";
import CommentsRouter from "./routes/comments/comments.router.js";
import LocationRouter from "./routes/locations/location.router.js";
import LikeRouter from "./routes/isLike/isLike.router.js";
import SearchingRouter from "./routes/searching/searching.router.js";
import BookmarkRouter from "./routes/bookmark/bookmark.router.js";
import RepliesRouter from "./routes/replies/replies.ruter.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import ErrorMiddleware from "./middlewares/error.middleware.js";
// import session from "express-session";
import swaggerConfig from "./swagger/swagger.js";
import swaggerUi from "swagger-ui-express";
import configurePassport from "./passport/index.js";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = 3003;

app.use(morgan("dev"));

// Passport 설정
configurePassport(); // configurePassport 함수 호출  // passport 불러온다.
app.use(passport.initialize()); //  Passport를 초기화.

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig.specs));

app.get("/", (req, res) => {
  res.send("Success");
});

app.use("/api", [
  UserProfileRouter,
  MainRouter,
  PostsRouter,
  CommentsRouter,
  LocationRouter,
  LikeRouter,
  BookmarkRouter,
  RepliesRouter,
  SearchingRouter,
]);

app.use("/auth", [KakaoRouter, UsersRouter]);
app.use(ErrorMiddleware);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});
