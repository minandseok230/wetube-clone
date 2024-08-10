import express from "express";
import morgan from "morgan";
import session from "express-session";
// import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

// Express Object
const app = express();
// choose morgan option
const logger = morgan("dev");

// view engine 설정
app.set("view engine", "pug");
// views 폴더 경로 설정
app.set("views", process.cwd() + "/src/views");
// X-Powered-By header 설정
app.set("x-powered-by", false);

// for parsing application/json
app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Middleware Morgan
app.use(logger);

//
app.use(express.json());

// 세션 초기화(브라우저에 쿠키 전송. express-session Middleware)
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    // 초기화 되지 않은 세션 저장 여부
    saveUninitialized: false,
    // 세션 저장 위치 설정
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

// Routers
// app.use(flash());
app.use(localMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/video", videoRouter);
app.use("/api", apiRouter);

export default app;
