import express from "express";
import cookieParser from "cookie-parser";
import PostsRouter from "./routes/posts.router.js";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [PostsRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
