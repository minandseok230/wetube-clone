// dotenv 추가
import "dotenv/config";
// db 연결
import "./db";
// Model 연결
import "./models/Video";
import "./models/User";
import "./models/Comment";

// Express Object
import app from "./server";

// Port Number
const PORT = 3000;
// URL
const URL = `http://localhost:${PORT}`;

const handleListening = () => console.log(`URL: ${URL}`);
// listen to server
app.listen(PORT, handleListening);
