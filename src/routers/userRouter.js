import express from "express";
import {
  getChangePassword,
  getEditProfile,
  githubLogin,
  githubLoginCallback,
  logout,
  postChangePassword,
  postEditProfile,
  profile,
} from "../controllers/userController";
import { protectorMiddleware, avatarUpload } from "../middlewares";

// Router Object (user)
const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEditProfile)
  .post(avatarUpload.single("avatar"), postEditProfile);
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/login", githubLogin);
userRouter.get("/github/callback", githubLoginCallback);
userRouter.get("/:id", profile);

export default userRouter;
