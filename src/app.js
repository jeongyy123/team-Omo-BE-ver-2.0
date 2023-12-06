import express from "express";
import UsersRouter from "./routes/users/user.router.js";
import AuthRouter from "./routes/users/auth.router.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import configurePassport from "./passport/index.js";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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
configurePassport(); // configurePassport 함수 호출

app.use(passport.initialize()); // passport 설정을 초기화
app.use(passport.session()); // passport를 세션과 연결

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "success" });
});

app.use("/auth", [UsersRouter, AuthRouter]);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});
