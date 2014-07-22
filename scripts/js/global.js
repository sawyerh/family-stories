(function() {
  var advanceShow, alphaWrap, animationEndEventName, betaWrap, content, contentElements, currentIndex, isAlpha;

  alphaWrap = document.querySelector('.alpha');

  betaWrap = document.querySelector('.beta');

  contentElements = {
    "alpha": {
      wrap: alphaWrap,
      bg: alphaWrap.querySelector('.bg'),
      image: alphaWrap.querySelector('.image')
    },
    "beta": {
      wrap: betaWrap,
      bg: betaWrap.querySelector('.bg'),
      image: betaWrap.querySelector('.image')
    }
  };

  content = [
    {
      image: "assets/1.jpg"
    }, {
      image: "assets/2.jpg"
    }
  ];

  currentIndex = -1;

  if (Modernizr.testProp('webkitAnimation')) {
    animationEndEventName = 'webkitAnimationEnd';
  } else if (Modernizr.testProp('mozAnimation')) {
    animationEndEventName = 'mozAnimationEnd';
  } else {
    animationEndEventName = 'animationEnd';
  }

  isAlpha = function(index) {
    return index % 2 === 0;
  };

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
    currentSet = isAlpha(currentIndex) ? contentElements["alpha"] : contentElements["beta"];
    nextSet = isAlpha(currentIndex) ? contentElements["beta"] : contentElements["alpha"];
    currentSet["bg"].src = content[currentIndex].image;
    currentSet["image"].src = content[currentIndex].image;
    currentSet["wrap"].classList.add('is-active');
    currentSet["wrap"].classList.add('fade-in');
    nextSet["wrap"].classList.add('is-exiting');
    nextSet["wrap"].classList.remove('is-active');
    return $(currentSet["wrap"]).on(animationEndEventName, function() {
      $(currentSet["wrap"]).off(animationEndEventName);
      nextSet["wrap"].classList.remove('is-exiting');
      nextSet["wrap"].classList.remove('fade-in');
      nextSet["bg"].src = content[nextIndex].image;
      return nextSet["image"].src = content[nextIndex].image;
    });
  };

  $(function() {
    advanceShow();
    return $(document).on('click', '.image-wrap', function() {
      return advanceShow();
    });
  });

}).call(this);
