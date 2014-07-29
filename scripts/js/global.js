(function() {
  var advanceShow, alphaWrap, animationEndEventName, audioDuration, audioPlayer, betaWrap, chaptersList, contentElements, currentIndex, currentItem, formatTime, getItemIndexByTime, getYoutubeIframe, hiddenSet, initAudioPlayer, initMap, nextItem, playToggle, progress, seekVideoByIndex, seekVideoByRatio, setMedia, setProgress, showItemByTime, time, toggleChapterList, transitionEndEventName, transitionEndEventNames, visibleSet;

  alphaWrap = document.querySelector('.alpha');

  audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'));

  audioDuration = null;

  betaWrap = document.querySelector('.beta');

  chaptersList = document.querySelector('.list');

  contentElements = {
    "alpha": {
      wrap: alphaWrap,
      bg: alphaWrap.querySelector('.bg'),
      image: alphaWrap.querySelector('.image'),
      map: alphaWrap.querySelector('.map'),
      video: alphaWrap.querySelector('.video'),
      videoFrame: alphaWrap.querySelector('.video-frame')
    },
    "beta": {
      wrap: betaWrap,
      bg: betaWrap.querySelector('.bg'),
      image: betaWrap.querySelector('.image'),
      map: betaWrap.querySelector('.map'),
      video: betaWrap.querySelector('.video'),
      videoFrame: betaWrap.querySelector('.video-frame')
    }
  };

  currentIndex = 0;

  currentItem = content[currentIndex];

  hiddenSet = contentElements["beta"];

  nextItem = content[currentIndex + 1];

  playToggle = document.querySelector('.play-toggle');

  progress = document.querySelector('.progress');

  time = document.querySelector('.time');

  visibleSet = contentElements["alpha"];

  if (Modernizr.testProp('webkitAnimation')) {
    animationEndEventName = 'webkitAnimationEnd';
  } else if (Modernizr.testProp('mozAnimation')) {
    animationEndEventName = 'mozAnimationEnd';
  } else {
    animationEndEventName = 'animationEnd';
  }

  transitionEndEventNames = {
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd',
    'transition': 'transitionend'
  };

  transitionEndEventName = transitionEndEventNames[Modernizr.prefixed('transition')];

  advanceShow = function() {
    var nextIndex;
    currentIndex += 1;
    currentItem = content[currentIndex];
    nextIndex = currentIndex + 1;
    if (nextIndex < content.length) {
      nextItem = content[nextIndex];
    }
    if (alphaWrap.classList.contains('is-active')) {
      visibleSet = contentElements["beta"];
      hiddenSet = contentElements["alpha"];
    } else {
      visibleSet = contentElements["alpha"];
      hiddenSet = contentElements["beta"];
    }
    visibleSet["wrap"].classList.add('is-active');
    hiddenSet["wrap"].classList.add('is-exiting');
    hiddenSet["wrap"].classList.remove('is-active');
    return $(visibleSet["wrap"]).on(transitionEndEventName, function() {
      $(visibleSet["wrap"]).off(transitionEndEventName);
      hiddenSet["wrap"].classList.remove('is-exiting');
      if (nextItem) {
        return setMedia(hiddenSet, nextItem);
      }
    });
  };

  initAudioPlayer = function() {
    audioPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
      setProgress(data.relativePosition, data.currentPosition);
      if (nextItem && data.currentPosition >= nextItem['start']) {
        nextItem = null;
        return advanceShow();
      }
    });
    audioPlayer.bind(SC.Widget.Events.SEEK, function(data) {
      setProgress(data.relativePosition, data.currentPosition);
      return showItemByTime(data.currentPosition);
    });
    audioPlayer.bind(SC.Widget.Events.PAUSE, function() {
      document.body.classList.remove('playing');
      document.body.classList.add('paused');
      return playToggle.innerHTML = 'play';
    });
    return audioPlayer.bind(SC.Widget.Events.PLAY, function() {
      document.body.classList.add('playing');
      document.body.classList.remove('paused');
      return playToggle.innerHTML = 'pause';
    });
  };

  initMap = function(set, item) {
    var latLong, myPano, panoramaOptions;
    latLong = new google.maps.LatLng(item['lat'], item['long']);
    panoramaOptions = {
      position: latLong,
      pov: {
        heading: item['heading'],
        pitch: item['pitch']
      },
      zoom: 1
    };
    myPano = new google.maps.StreetViewPanorama(set["map"], panoramaOptions);
    return myPano.setVisible(true);
  };

  formatTime = function(ms) {
    var minutes, seconds, timeString, totalSeconds;
    totalSeconds = ms / 1000;
    totalSeconds %= 3600;
    minutes = Math.floor(totalSeconds / 60);
    seconds = Math.floor(totalSeconds % 60);
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    timeString = '';
    timeString += minutes + ':';
    timeString += seconds;
    return timeString;
  };

  getItemIndexByTime = function(time) {
    var index, item, _i, _len;
    currentIndex = 0;
    for (index = _i = 0, _len = content.length; _i < _len; index = ++_i) {
      item = content[index];
      if (time >= item['start']) {
        currentIndex = index;
      }
    }
    return currentIndex;
  };

  getYoutubeIframe = function(id) {
    return "<iframe width='420' height='315' src='//www.youtube.com/embed/" + id + "?rel=0&loop=1&autoplay=1&controls=0&playsinline=1&modestbranding=1&playlist=" + id + "' frameborder='0'></iframe>";
  };

  showItemByTime = function(time) {
    var nextIndex;
    currentIndex = getItemIndexByTime(time);
    currentItem = content[currentIndex];
    nextIndex = currentIndex + 1;
    setMedia(visibleSet, currentItem);
    if (nextIndex < content.length) {
      nextItem = content[nextIndex];
      return setMedia(hiddenSet, nextItem);
    }
  };

  setMedia = function(set, item) {
    var currentType, hasMap, removedType, type, _i, _len, _ref;
    hasMap = false;
    set["bg"].src = item['image'];
    if (item['video']) {
      set["videoFrame"].innerHTML = getYoutubeIframe(item['youtube']);
      set["video"].classList.remove('is-hidden');
      set["image"].classList.add('is-hidden');
      set["wrap"].style['background'] = item['color'];
      currentType = 'video';
    } else if (item['image']) {
      if (item['lat']) {
        hasMap = true;
        initMap(set, item);
        set["map"].classList.remove('is-hidden');
        set["image"].classList.add('is-hidden');
        currentType = 'map';
      } else {
        set["image"].src = item['image'];
        set["image"].classList.remove('is-hidden');
        currentType = 'image';
      }
      set["videoFrame"].innerHTML = '';
      set["video"].classList.add('is-hidden');
      set["wrap"].style['background'] = '';
    }
    if (!hasMap) {
      set["map"].classList.add('is-hidden');
      set["map"].innerHTML = '';
    }
    removedType = currentType === 'video' ? 'image' : 'video';
    _ref = ["image", "map", "video"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      if (type !== currentType) {
        set["wrap"].classList.remove("is-" + type);
      }
    }
    return set["wrap"].classList.add("is-" + currentType);
  };

  setProgress = function(pos, ms) {
    progress.style.width = "" + (pos * 100) + "%";
    return time.innerHTML = formatTime(ms);
  };

  seekVideoByIndex = function(index) {
    time = content[index]["start"];
    audioPlayer.play();
    return audioPlayer.seekTo(time);
  };

  seekVideoByRatio = function(pos) {
    if (!audioDuration) {
      return audioPlayer.getDuration(function(data) {
        audioDuration = data;
        return seekVideoByRatio(pos);
      });
    } else {
      return audioPlayer.seekTo(audioDuration * pos);
    }
  };

  toggleChapterList = function() {
    chaptersList.classList.toggle('is-hidden');
    document.body.classList.toggle('showing-chapters');
    if (chaptersList.classList.contains('is-hidden')) {
      return $(window).off('keyup.chapters');
    } else {
      return $(window).on('keyup.chapters', function(e) {
        if (e.keyCode === 27) {
          return toggleChapterList();
        }
      });
    }
  };

  $(function() {
    setMedia(visibleSet, content[0]);
    setMedia(hiddenSet, content[1]);
    initAudioPlayer();
    $('.intro').on('click', function() {
      document.body.classList.remove('not-played');
      return audioPlayer.play();
    });
    $(playToggle).on('click', function() {
      return audioPlayer.toggle();
    });
    $('.chapters-toggle').on('click', function() {
      return toggleChapterList();
    });
    $('.chapter-link').on('click', function() {
      var index;
      index = this.getAttribute('data-index');
      toggleChapterList();
      document.body.classList.remove('not-played');
      return seekVideoByIndex(index);
    });
    if (!(Modernizr['cssfilters'] || Modernizr['svgfilters'])) {
      document.body.classList.add('no-blur');
    }
    $(window).on('keyup.global', function(e) {
      if (e.keyCode === 32) {
        document.body.classList.remove('not-played');
        return audioPlayer.toggle();
      }
    });
    return $('.seek-bar').on('click', function(ev) {
      var $div, offset, x;
      $div = $(ev.target);
      offset = $div.offset();
      x = ev.clientX - offset.left;
      if (x) {
        return seekVideoByRatio(x / this.offsetWidth);
      }
    });
  });

}).call(this);
