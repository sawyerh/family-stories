/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-prefixed-testprop-testallprops-hasevent-domprefixes
 */
;window.Modernizr=function(a,b,c){function x(a){i.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a){var e=a[d];if(!A(e,"-")&&i[e]!==c)return b=="pfx"?e:!0}return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+m.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+n.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l="Webkit Moz O ms",m=l.split(" "),n=l.toLowerCase().split(" "),o={},p={},q={},r=[],s=r.slice,t,u=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=z(e[d],"function"),z(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=s.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(s.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(s.call(arguments)))};return e});for(var E in o)w(o,E)&&(t=E.toLowerCase(),e[t]=o[E](),r.push((e[t]?"":"no-")+t));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),h=j=null,e._version=d,e._domPrefixes=n,e._cssomPrefixes=m,e.hasEvent=u,e.testProp=function(a){return B([a])},e.testAllProps=D,e.prefixed=function(a,b,c){return b?D(a,b,c):D(a,"pfx")},e}(this,this.document);
(function() {
  var advanceShow, alphaWrap, animationEndEventName, audioPlayer, betaWrap, chaptersList, contentElements, currentIndex, currentItem, goTo, hiddenSet, initAudioPlayer, initMap, nextItem, playToggle, setMedia, transitionEndEventName, transitionEndEventNames, visibleSet;

  alphaWrap = document.querySelector('.alpha');

  audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'));

  betaWrap = document.querySelector('.beta');

  chaptersList = document.querySelector('.list');

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
    audioPlayer.setVolume(0);
    audioPlayer.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
      if (nextItem && data.currentPosition >= nextItem['start']) {
        nextItem = null;
        return advanceShow();
      }
    });
    audioPlayer.bind(SC.Widget.Events.LOAD_PROGRESS, function(data) {
      console.log("Loading");
      return console.log(data);
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
    }, 500);
  };

  setMedia = function(set, item) {
    var currentType, hasMap, removedType, type, _i, _len, _ref;
    hasMap = false;
    set["bg"].src = item['image'];
    if (item['video']) {
      set["video"].src = item['video'];
      set["video"].setAttribute('poster', item['image']);
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
      set["video"].src = '';
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

  $(function() {
    setMedia(visibleSet, content[0]);
    setMedia(hiddenSet, content[1]);
    initAudioPlayer();
    $('.start-button').on('click', function() {
      document.body.classList.remove('not-played');
      return audioPlayer.play();
    });
    $(playToggle).on('click', function() {
      return audioPlayer.toggle();
    });
    $('.chapters-toggle').on('click', function() {
      return chaptersList.classList.toggle('is-hidden');
    });
    return $('.chapter-link').on('click', function() {
      var index;
      index = this.getAttribute('data-index');
      chaptersList.classList.add('is-hidden');
      document.body.classList.remove('not-played');
      return goTo(index);
    });
  });

}).call(this);
