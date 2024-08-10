import mongoose from "mongoose";

// 스키마 정의
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 50,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  thumbUrl: { type: String, required: true },
  description: { type: String, trim: true, maxLength: 1000 },
  created: { type: Date, required: true, default: Date.now, trim: true },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, required: true, default: 0, trim: true },
    rating: { type: Number, required: true, default: 0, trim: true },
  },
  comments: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

// separated by comma
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((hashtag) => (hashtag.startsWith("#") ? hashtag : `#${hashtag}`));
});

// 모델 생성. Video는 모델의 이름.
const Video = mongoose.model("Video", videoSchema);

export default Video;
