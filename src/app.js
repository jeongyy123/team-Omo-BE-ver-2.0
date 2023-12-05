import express from "express";
import UsersRouter from "./routes/users.router.js";
import UsersKakaoRouter from "./routes/users.kakao.router.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "success" });
});

app.use("/api", [UsersRouter, UsersKakaoRouter]);

app.listen(PORT, (req, res) => {
  console.log(PORT, `포트 ${PORT}번이 열렸습니다.`);
});
