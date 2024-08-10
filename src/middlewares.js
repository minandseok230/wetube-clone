import multer from "multer";
// local 변수 설정
export const localMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Wetube";
  res.locals.loggedInUser = req.session.user || {};
  next();
};

// 로그인 유저만 접근 가능
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    // req.flash("error", "Not authorized");
    return res.redirect("/login");
  }
};

// 비로그인 유저만 접근 가능
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    // req.flash("error", "Log in first.");
    return res.redirect("/");
  }
};

// 프로필 사진 업로드 Middleware
export const avatarUpload = multer({
  dest: "uploads/avatars/", // 저장할 경로
  limits: {
    fileSize: 3000000,
  },
});

// 비디오 업로드 Middleware
export const videoUpload = multer({
  dest: "uploads/videos/", // 저장할 경로
  limits: {
    fileSize: 10000000,
  },
});
