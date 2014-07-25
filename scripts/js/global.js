(function() {
  var advanceShow, alphaWrap, animationEndEventName, audioPlayer, betaWrap, contentElements, currentIndex, currentItem, goTo, hiddenSet, initAudioPlayer, initMap, nextItem, playToggle, setMedia, transitionEndEventName, transitionEndEventNames, visibleSet;

  alphaWrap = document.querySelector('.alpha');

  audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'));

  betaWrap = document.querySelector('.beta');

  contentElements = {
    "alpha": {
      wrap: alphaWrap,
      bg: alphaWrap.querySelector('.bg'),
      image: alphaWrap.querySelector('.image'),
      map: alphaWrap.querySelector('.map'),
      video: alphaWrap.querySelector('.video')
    },
    "beta": {
      wrap: betaWrap,
      bg: betaWrap.querySelector('.bg'),
      image: betaWrap.querySelector('.image'),
      map: betaWrap.querySelector('.map'),
      video: betaWrap.querySelector('.video')
    }
  };

  currentIndex = 0;

  currentItem = content[currentIndex];

  hiddenSet = contentElements["beta"];

  nextItem = content[currentIndex + 1];

  playToggle = document.querySelector('.play-toggle');

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
    if (visibleSet["wrap"].classList.contains('is-video')) {
      visibleSet["video"].play();
    }
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
      console.log(data.currentPosition);
      if (nextItem && data.currentPosition >= nextItem['start']) {
        console.log("Advance: " + data.currentPosition + " >= " + nextItem['start']);
        nextItem = null;
        return advanceShow();
      }
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

  goTo = function(index) {
    var time;
    currentIndex = index - 1;
    setMedia(hiddenSet, content[index]);
    advanceShow();
    time = currentItem["start"];
    audioPlayer.play();
    return window.setTimeout(function() {
      return audioPlayer.seekTo(time);
    }, 300);
  };

  setMedia = function(set, item) {
    var currentType, hasMap, removedType;
    hasMap = false;
    if (item['image']) {
      set["bg"].src = item['image'];
      if (item['lat']) {
        hasMap = true;
        initMap(set, item);
        set["map"].classList.remove('is-hidden');
        set["image"].classList.add('is-hidden');
      } else {
        set["image"].src = item['image'];
        set["image"].classList.remove('is-hidden');
      }
      set["bg"].classList.remove('is-hidden');
      set["video"].src = '';
      set["video"].classList.add('is-hidden');
      set["wrap"].style['background'] = '';
      currentType = 'image';
    } else if (item['video']) {
      set["video"].src = item['video'];
      set["video"].classList.remove('is-hidden');
      set["bg"].classList.add('is-hidden');
      set["image"].classList.add('is-hidden');
      set["wrap"].style['background'] = item['color'];
      currentType = 'video';
    }
    if (!hasMap) {
      set["map"].classList.add('is-hidden');
      set["map"].innerHTML = '';
    }
    removedType = currentType === 'video' ? 'image' : 'video';
    set["wrap"].classList.remove("is-" + removedType);
    return set["wrap"].classList.add("is-" + currentType);
  };

  $(function() {
    setMedia(visibleSet, content[0]);
    setMedia(hiddenSet, content[1]);
    initAudioPlayer();
    $('.start-button').on('click', function() {
      document.body.classList.remove('not-played');
      return audioPlayer.play();
    });
    return $(playToggle).on('click', function() {
      return audioPlayer.toggle();
    });
  });

}).call(this);
