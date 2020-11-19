/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const alphaWrap = document.querySelector(".alpha");
const audioPlayer = SC.Widget(document.querySelector(".audio-player iframe"));
let audioDuration = null;
const betaWrap = document.querySelector(".beta");
const chaptersList = document.querySelector(".list");
const contentElements = {
  alpha: {
    wrap: alphaWrap,
    bg: alphaWrap.querySelector(".bg"),
    image: alphaWrap.querySelector(".image"),
    map: alphaWrap.querySelector(".map"),
    video: alphaWrap.querySelector(".video"),
    videoFrame: alphaWrap.querySelector(".video-frame"),
  },
  beta: {
    wrap: betaWrap,
    bg: betaWrap.querySelector(".bg"),
    image: betaWrap.querySelector(".image"),
    map: betaWrap.querySelector(".map"),
    video: betaWrap.querySelector(".video"),
    videoFrame: betaWrap.querySelector(".video-frame"),
  },
};
let currentIndex = 0;
let currentItem = content[currentIndex];

let hiddenSet = contentElements["beta"];
let nextItem = content[currentIndex + 1];
const playToggle = document.querySelector(".play-toggle");
const progress = document.querySelector(".progress");
const timeEl = document.querySelector(".time");
let visibleSet = contentElements["alpha"];

const animationEndEventName = "animationEnd";
const transitionEndEventName = "transitionend";

// Toggles the visibility of the sets
// and preloads the next item after the transition
const advanceShow = function () {
  currentIndex += 1;
  currentItem = content[currentIndex];
  const nextIndex = currentIndex + 1;

  if (nextIndex < content.length) {
    nextItem = content[nextIndex];
  }

  if (alphaWrap.classList.contains("is-active")) {
    visibleSet = contentElements["beta"];
    hiddenSet = contentElements["alpha"];
  } else {
    visibleSet = contentElements["alpha"];
    hiddenSet = contentElements["beta"];
  }

  // Toggle visibility of sets
  visibleSet["wrap"].classList.add("is-active");
  hiddenSet["wrap"].classList.add("is-exiting");
  hiddenSet["wrap"].classList.remove("is-active");

  // Play if video
  // if visibleSet["wrap"].classList.contains('is-video')
  //   visibleSet["video"].play()

  // Preload and hide next content after current item's animationEnd
  return $(visibleSet["wrap"]).on(transitionEndEventName, function () {
    $(visibleSet["wrap"]).off(transitionEndEventName);
    hiddenSet["wrap"].classList.remove("is-exiting");
    if (nextItem) {
      return setMedia(hiddenSet, nextItem);
    }
  });
};

const initAudioPlayer = function () {
  // Listen to the play progress
  audioPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function (data) {
    setProgress(data.relativePosition, data.currentPosition);

    if (nextItem && data.currentPosition >= nextItem["start"]) {
      nextItem = null;
      return advanceShow();
    }
  });

  audioPlayer.bind(SC.Widget.Events.SEEK, function (data) {
    setProgress(data.relativePosition, data.currentPosition);
    return showItemByTime(data.currentPosition);
  });

  audioPlayer.bind(SC.Widget.Events.PAUSE, function () {
    document.body.classList.remove("playing");
    document.body.classList.add("paused");
    return (playToggle.innerHTML = "play");
  });

  return audioPlayer.bind(SC.Widget.Events.PLAY, function () {
    document.body.classList.add("playing");
    document.body.classList.remove("paused");
    return (playToggle.innerHTML = "pause");
  });
};

const initMap = function (set, item) {
  const latLong = new google.maps.LatLng(item["lat"], item["long"]);
  const panoramaOptions = {
    position: latLong,
    pov: {
      heading: item["heading"],
      pitch: item["pitch"],
    },
    zoom: 1,
  };
  const myPano = new google.maps.StreetViewPanorama(
    set["map"],
    panoramaOptions
  );
  return myPano.setVisible(true);
};

const formatTime = function (ms) {
  let totalSeconds = ms / 1000;

  // Change to minute:second format
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = Math.floor(totalSeconds % 60);

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  // Format time string
  let timeString = "";
  timeString += minutes + ":";
  timeString += seconds;

  return timeString;
};

const getItemIndexByTime = function (time) {
  currentIndex = 0;
  for (let index = 0; index < content.length; index++) {
    const item = content[index];
    if (time >= item["start"]) {
      currentIndex = index;
    }
  }
  return currentIndex;
};

const getYoutubeIframe = (id) =>
  `<iframe width='420' height='315' src='//www.youtube.com/embed/${id}?rel=0&loop=1&autoplay=1&controls=0&playsinline=1&modestbranding=1&playlist=${id}' frameborder='0'></iframe>`;

var showItemByTime = function (time) {
  currentIndex = getItemIndexByTime(time);
  currentItem = content[currentIndex];
  const nextIndex = currentIndex + 1;

  setMedia(visibleSet, currentItem);

  if (nextIndex < content.length) {
    nextItem = content[nextIndex];
    return setMedia(hiddenSet, nextItem);
  }
};

var setMedia = function (set, item) {
  let currentType;
  let hasMap = false;

  set["bg"].src = item["image"];

  if (item["video"]) {
    set["videoFrame"].innerHTML = getYoutubeIframe(item["youtube"]);
    set["video"].classList.remove("is-hidden");
    set["image"].classList.add("is-hidden");
    set["wrap"].style["background"] = item["color"];
    currentType = "video";
  } else if (item["image"]) {
    if (item["lat"]) {
      hasMap = true;
      initMap(set, item);
      set["map"].classList.remove("is-hidden");
      set["image"].classList.add("is-hidden");
      currentType = "map";
    } else {
      set["image"].src = item["image"];
      set["image"].classList.remove("is-hidden");
      currentType = "image";
    }

    set["videoFrame"].innerHTML = ""; // stops the video from loading anymore
    set["video"].classList.add("is-hidden");
    set["wrap"].style["background"] = "";
  }

  if (!hasMap) {
    set["map"].classList.add("is-hidden");
    set["map"].innerHTML = "";
  }

  const removedType = currentType === "video" ? "image" : "video";

  for (let type of ["image", "map", "video"]) {
    if (type !== currentType) {
      set["wrap"].classList.remove(`is-${type}`);
    }
  }

  return set["wrap"].classList.add(`is-${currentType}`);
};

var setProgress = function (pos, ms) {
  progress.style.width = `${pos * 100}%`;
  return (timeEl.innerHTML = formatTime(ms));
};

const seekVideoByIndex = function (index) {
  const time = content[index]["start"];
  audioPlayer.play();
  return audioPlayer.seekTo(time);
};

var seekVideoByRatio = function (pos) {
  if (!audioDuration) {
    return audioPlayer.getDuration(function (data) {
      audioDuration = data;
      return seekVideoByRatio(pos);
    });
  } else {
    return audioPlayer.seekTo(audioDuration * pos);
  }
};

var toggleChapterList = function () {
  chaptersList.classList.toggle("is-hidden");
  document.body.classList.toggle("showing-chapters");

  if (chaptersList.classList.contains("is-hidden")) {
    return $(window).off("keyup.chapters");
  } else {
    return $(window).on("keyup.chapters", function (e) {
      if (e.keyCode === 27) {
        return toggleChapterList();
      }
    }); // esc
  }
};

$(function () {
  setMedia(visibleSet, content[0]);
  setMedia(hiddenSet, content[1]);
  initAudioPlayer();

  $(".intro").on("click", function () {
    document.body.classList.remove("not-played");
    return audioPlayer.play();
  });

  $(playToggle).on("click", () => audioPlayer.toggle());

  $(".chapters-toggle").on("click", () => toggleChapterList());

  $(".chapter-link").on("click", function () {
    const index = this.getAttribute("data-index");
    toggleChapterList();
    document.body.classList.remove("not-played");
    return seekVideoByIndex(index);
  });

  // Play/pause shortcut
  $(window).on("keyup.global", function (e) {
    if (e.keyCode === 32) {
      // space
      document.body.classList.remove("not-played");
      return audioPlayer.toggle();
    }
  });

  // Seek bar
  return $(".seek-bar").on("click", function (ev) {
    const $div = $(ev.target);
    const offset = $div.offset();
    const x = ev.clientX - offset.left;
    if (x) {
      return seekVideoByRatio(x / this.offsetWidth);
    }
  });
});
