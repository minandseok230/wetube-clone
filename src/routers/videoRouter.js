import express from "express";
import {
  deleteVideo,
  getEditVideo,
  getUploadVideo,
  postEditVideo,
  postUploadVideo,
  video,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

// Router Object (video)
const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", video);
videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(protectorMiddleware)
  .get(getEditVideo)
  .post(postEditVideo);
videoRouter
  .route("/:id([0-9a-f]{24})/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUploadVideo)
  .post(
    videoUpload.fields([{ name: "video" }, { name: "thumb" }]),
    postUploadVideo
  );

export default videoRouter;
