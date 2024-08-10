// Video Model Objet
import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

// 전체 비디오가 보여진다.
export const home = async (req, res) => {
  // 모든 비디오(문서)를 찾는다. created를 기준으로 내림차순으로 정렬한다.
  const videos = await Video.find({})
    .sort({ created: "desc" })
    .populate("owner");
  return res.render("view_video/home", { pageTitle: "Home", videos });
};

// 비디오가 찾아진다.
export const search = async (req, res) => {
  const { searchValue } = req.query;
  let videos = [];
  if (searchValue) {
    videos = await Video.find({
      title: {
        // 값 포함. 대소문자 구분 x.
        $regex: new RegExp(searchValue, "i"),
      },
    });
  }
  return res.render("view_video/search", { pageTitle: "Search Video", videos });
};

// 비디오가 업로드 된다. (Get)
export const getUploadVideo = (req, res) => {
  return res.render("view_video/upload-video", { pageTitle: "Upload Video" });
};

// 비디오가 업로드 된다. (Post)
export const postUploadVideo = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    // video 컬렉션 생성
    const newVideo = await Video.create({
      title, // = title: title,
      description,
      fileUrl: video[0].path,
      thumbUrl: thumb[0].path.replace(/[\\]/g, "/"),
      owner: _id,
      // separated by comma
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

// 비디오가 수정된다. (Get)
export const getEditVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    // req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("view_video/edit-video", {
    pageTitle: `Edit Video: ${video.title}`,
    video,
  });
};

// 비디오가 수정된다. (Post)
export const postEditVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  // 비디오 존재 여부 확인
  const videoCheck = await Video.exists({ _id: id });
  const video = await Video.findOne({ _id: id });
  if (!videoCheck) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    // req.flash("error", "You are not the the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  // req.flash("success", "Changes saved.");
  return res.redirect(`/video/${id}`);
};

// 비디오가 삭제된다.
export const deleteVideo = async (req, res) => {
  const { id } = req.params; // 현재 비디오 id
  const {
    user: { _id },
  } = req.session; // 섹션에서 현재 로그인된 유저 id
  const videoCheck = await Video.exists({ _id: id }); // 현재 비디오의 id가 DB에 있다면 객체를 반환해라
  const video = await Video.findOne({ _id: id });
  if (!videoCheck) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

// 비디오가 보여진다.
export const video = async (req, res) => {
  // URL에서 매개변수 id 가져오기.
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner").populate("comments");
  // 404 Page
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  return res.render("view_video/video", {
    pageTitle: video.title,
    video,
  });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

// 댓글 생성
export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};
