const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsVideoLeaveTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const keydownSpace = (event) => {
  if (event.code === "Space") {
    // 기본 동작(페이지 스크롤)을 방지
    event.preventDefault();

    // 비디오가 재생 중인지 확인
    if (video.paused) {
      // 비디오가 일시 정지 상태라면 재생
      video.play();
    } else {
      // 비디오가 재생 중이라면 일시 정지
      video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  }
};

const handleMuteClick = (event) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(Math.floor(video.duration));
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreen = () => {
  const fullScreen = document.fullscreenElement; // fullscreenElement or null
  if (fullScreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => videoControls.classList.remove("showing");

const handleVideoMouseMove = () => {
  // 마우스가 비디오 위에서 움직이고 난 뒤
  if (controlsVideoLeaveTimeout) {
    // 컨트롤러에 타이머가 적용되었다면
    clearTimeout(controlsVideoLeaveTimeout); // 타이머 초기화
    controlsVideoLeaveTimeout = null; // null을 저장하지 않으면 계속 숫자가 저장되어 메모리에 영향을 준다.
  }
  if (controlsMovementTimeout) {
    // 컨트롤러에 타이머가 적용되었다면
    clearTimeout(controlsMovementTimeout); // 타이머 초기화
    controlsMovementTimeout = null; // null을 저장하지 않으면 계속 숫자가 저장되어 메모리에 영향을 준다.
  }
  videoControls.classList.add("showing"); // 컨트롤러가 보여진다.
  controlsMovementTimeout = setTimeout(hideControls, 500); // 0.5초 후 컨트롤러를 숨긴다.
};

const handleVideoMouseLeave = () => {
  // 마우스가 비디오를 떠나고 난 뒤
  controlsVideoLeaveTimeout = setTimeout(hideControls, 500); // 0.5초 후 컨트롤러를 숨긴다.
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/video/${id}/view`, {
    method: "post",
  });
};

document.addEventListener("keydown", keydownSpace);
playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMuteClick);
fullScreenBtn.addEventListener("click", handleFullscreen);
volumeRange.addEventListener("input", handleVolumeChange);
timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("click", handlePlayClick);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
video.addEventListener("mousemove", handleVideoMouseMove);
video.addEventListener("mouseleave", handleVideoMouseLeave);
videoContainer.addEventListener("mousemove", handleVideoMouseMove);
videoContainer.addEventListener("mouseleave", handleVideoMouseLeave);
