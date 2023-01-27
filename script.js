// Variables
const video = document.querySelector("video");
const playPauseBtn = document.querySelector(".play-pause");
const audioIcons = document.querySelector("#audioIcons");
const volume = document.querySelector(".volume");
const miniPlayer = document.querySelector(".mini-player");
const videoSpeed = document.querySelector(".speed");
const loopVid = document.querySelector(".loop");
const theaterMode = document.querySelector(".theater");
const fullScreen = document.querySelector(".fullscreen");
const timeline = document.querySelector(".timeline-box");
const progress = document.querySelector(".progress");
const previewBox = document.querySelector(".preview-box");
const previewTime = document.querySelector(".preview-time");
const previewVid = document.querySelector(".preview");
const eventsToUpdateControls = ['loadedmetadata', 'pause', 'play', 'volumechange', 'ratechange'];

//Controls Event Listeners
playPauseBtn.addEventListener("click", togglePlayPause);
audioIcons.addEventListener("click", toggleAudioMode);
volume.addEventListener("input", changeVolume);
loopVid.addEventListener("click", toggleLoop);
miniPlayer.addEventListener("click", toggleMiniPlayer);
theaterMode.addEventListener("click", toggleTheaterMode);
fullScreen.addEventListener("click", toggleFullScreen);
videoSpeed.addEventListener("click", changeVideospeed);

// Video Event Listeners
video.addEventListener("click", togglePlayPause);
video.addEventListener("progress", updateVidBuffered);
video.addEventListener("timeupdate", updateVidProgress);
timeline.addEventListener("pointermove", seekPreview); //hovering through the timeline
timeline.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  video.onseeked = null; //remove this event for preview box to function properly
  timeline.setPointerCapture(e.pointerId);
  updateTimeline(e);
  timeline.addEventListener("pointermove", updateTimelineWhileSeeking);
  timeline.addEventListener("pointerup", discardEventListeners);
  
  function updateTimelineWhileSeeking(e) {
    video.pause()
    timeline.classList.add("seeking");
    updateTimeline(e);
    seekPreview(e);
  }
  function discardEventListeners() {
    video.onseeked = () => (previewBox.style.display = "none");
    timeline.removeEventListener("pointermove", updateTimelineWhileSeeking);
    timeline.removeEventListener("pointerup", discardEventListeners);
    timeline.classList.remove("seeking");
    video.play()
  }
}); 
eventsToUpdateControls.forEach(event => video.addEventListener(event, updateControls))

// FUNCTIONS
function togglePlayPause() {
  video.paused ? video.play() : video.pause();
  playPauseBtn.classList.toggle("paused", video.paused);
}

function toggleAudioMode() {
  video.muted = video.muted ? false : true;
  updateVolume();
}

function changeVolume() {
  video.volume = volume.value;
  video.muted = video.volume === 0;
  updateVolume();
}

function updateVolume() {
  if (video.muted) {
    audioIcons.dataset.audioicon = "muted";
  } else if (video.volume <= 0.5) {
    audioIcons.dataset.audioicon = "low";
  } else if (video.volume > 0.5) {
    audioIcons.dataset.audioicon = "high";
  }
  volume.value = video.volume;
}

function updateControls() {
  updateVidBuffered();
  playPauseBtn.classList.toggle("paused", video.paused);
  updateVolume();
  videoSpeed.innerText = `${video.playbackRate}x`;
}

function toggleLoop() {
  video.loop = video.loop ? false : true;
  loopVid.classList.toggle("active", video.loop);
}

function toggleMiniPlayer() {
  if (!document.pictureInPictureElement) {
    video.requestPictureInPicture();
  } else {
    document.exitPictureInPicture();
  }
}

function toggleTheaterMode() {
  const videoPlayer = document.querySelector(".video-player");
  videoPlayer.classList.toggle("theater-active");
}

function toggleFullScreen() {
  video.addEventListener("fullscreenerror", () => {
    alert("Fullscreen Is Not Supported...");
  });

  if (!document.fullscreenElement) {
    video.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function changeVideospeed() {
  video.playbackRate += 0.5;
  video.playbackRate = video.playbackRate === 2.5 ? 0.5 : video.playbackRate;
  videoSpeed.innerText = `${video.playbackRate}x`;
}

function timeConversion(t) {
  // t is basically video.currentTime or video.duration
  let hr = Math.floor(t / 60 / 60);
  let min = Math.floor((t / 60) % 60);
  let sec = Math.floor(t % 60);

  sec = sec < 10 ? `0${sec}` : sec;
  min = min < 10 ? `0${min}` : min;

  let fullTime = hr <= 0 ? `${min}:${sec}` : `${hr}:${min}:${sec}`;
  return fullTime;
}
//Show the part of the video that can be played without interruption
function updateVidBuffered() {
  if (video.readyState <= 0) return; //video not loaded yet
  document.querySelector(".total").innerText = timeConversion(video.duration);
  const buffered = document.querySelector(".buffered");
  //Get video timerange that's available to watch without loading
  const videoSeekableInPercent =
    (video.seekable.end(video.seekable.length - 1) / video.duration) * 100;
  buffered.style.width = `${videoSeekableInPercent}%`;
}
// Current time of the video displayed by the timeline
function updateVidProgress() {
  if (video.ended) {
    playPauseBtn.classList.toggle("paused", video.paused);
    return;
  }

  document.querySelector(".current").innerText = timeConversion(
    video.currentTime
  );
  const elapsedTimeInPercent = (video.currentTime / video.duration) * 100;
  progress.style.width = `${elapsedTimeInPercent}%`;
}
// update the timeline when seeking through the video
function updateTimeline(e) {
  const timelineWidth = timeline.getBoundingClientRect().width;
  const currPosition = (e.offsetX / timelineWidth) * 100;
  progress.style.width = `${currPosition}%`;
  video.currentTime = (e.offsetX / timelineWidth) * video.duration;
}

function seekPreview(e) {
  previewBox.style.display = "block";
  const timelineWidth = timeline.getBoundingClientRect().width;
  previewBox.style.setProperty("--offsetX", `${e.offsetX}px`);
  previewVid.currentTime = (e.offsetX / timelineWidth) * previewVid.duration;
  previewTime.innerText = timeConversion(
    (e.offsetX / timelineWidth) * previewVid.duration
  );
  timeline.onpointerout = () => (previewBox.style.display = "none");
}

// For Keyboard Accessibility
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case " ":
      const activeOnBodyOrVideo =
        document.activeElement === document.body ||
        document.activeElement === video;
      if (activeOnBodyOrVideo) {
        togglePlayPause();
      }
      break;
    case "m":
      toggleMiniPlayer();
      break;
    case "l":
      toggleLoop();
      break;
    case "t":
      toggleTheaterMode();
      break;
    case "s":
      changeVideospeed();
      break;
    case "ArrowLeft":
      if (document.activeElement === volume) return;
      video.currentTime -= 3;
      break;
    case "ArrowRight":
      if (document.activeElement === volume) return;
      video.currentTime += 3;
      break;
    default:
      break;
  }
});
