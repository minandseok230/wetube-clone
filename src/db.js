import mongoose from "mongoose";

// Node.js와 Mongo DB와 연결. wetube는 데이터베이스 이름.
mongoose.connect(process.env.DB_URL);

// Mongoose Connect Object
const db = mongoose.connection;

const handleError = (error) => console.log("DB Error", error);
const handleOpen = () => console.log("Connected to DB!");

// Error Event. on: 반복 실행.
db.on("error", handleError);
// Oepn Event. once: 한 번 실행.
db.once("open", handleOpen);
