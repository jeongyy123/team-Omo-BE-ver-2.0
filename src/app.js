import express from "express";
import mainRouter from './routes/main/main.router.js'

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api", [mainRouter]);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
