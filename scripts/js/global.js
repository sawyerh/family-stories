(function() {
  var advanceShow, alphaWrap, animationEndEventName, audioPlayer, betaWrap, contentElements, currentIndex, initAudioPlayer, setMedia;

  alphaWrap = document.querySelector('.alpha');

  betaWrap = document.querySelector('.beta');

  audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'));

  contentElements = {
    "alpha": {
      wrap: alphaWrap,
      bg: alphaWrap.querySelector('.bg'),
      image: alphaWrap.querySelector('.image'),
      video: alphaWrap.querySelector('.video')
    },
    "beta": {
      wrap: betaWrap,
      bg: betaWrap.querySelector('.bg'),
      image: betaWrap.querySelector('.image'),
      video: betaWrap.querySelector('.video')
    }
  };

  currentIndex = -1;

  if (Modernizr.testProp('webkitAnimation')) {
    animationEndEventName = 'webkitAnimationEnd';
  } else if (Modernizr.testProp('mozAnimation')) {
    animationEndEventName = 'mozAnimationEnd';
  } else {
    animationEndEventName = 'animationEnd';
  }

  advanceShow = function() {
    var currentSet, nextIndex, nextSet;
    currentIndex += 1;
    if (currentIndex >= content.length) {
      currentIndex = 0;
    }
    nextIndex = currentIndex + 1;
    if (nextIndex >= content.length) {
      nextIndex = 0;
    }
    if (contentElements["alpha"]["wrap"].classList.contains('is-active')) {
      currentSet = contentElements["beta"];
      nextSet = contentElements["alpha"];
    } else {
      currentSet = contentElements["alpha"];
      nextSet = contentElements["beta"];
    }
    currentSet["wrap"].classList.add('is-active');
    currentSet["wrap"].classList.add('fade-in');
    nextSet["wrap"].classList.add('is-exiting');
    nextSet["wrap"].classList.remove('is-active');
    if (currentSet["wrap"].classList.contains('is-video')) {
      currentSet["video"].play();
    }
    return $(currentSet["wrap"]).on(animationEndEventName, function() {
      $(currentSet["wrap"]).off(animationEndEventName);
      nextSet["wrap"].classList.remove('is-exiting');
      nextSet["wrap"].classList.remove('fade-in');
      return setMedia(nextSet, content[nextIndex]);
    });
  };

  initAudioPlayer = function() {
    return audioPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
      return console.log(data.currentPosition / 1000);
    });
  };

  setMedia = function(set, item) {
    var currentType, removedType;
    if (item['image']) {
      set["bg"].src = item['image'];
      set["image"].src = item['image'];
      set["bg"].classList.remove('is-hidden');
      set["image"].classList.remove('is-hidden');
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
    removedType = currentType === 'video' ? 'image' : 'video';
    set["wrap"].classList.remove("is-" + removedType);
    return set["wrap"].classList.add("is-" + currentType);
  };

  $(function() {
    setMedia(contentElements["alpha"], content[0]);
    advanceShow();
    initAudioPlayer();
    return $(document).on('click', '.image-wrap', function() {
      return advanceShow();
    });
  });

}).call(this);
