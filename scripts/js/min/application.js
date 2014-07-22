/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-prefixed-testprop-testallprops-hasevent-domprefixes
 */
;window.Modernizr=function(a,b,c){function x(a){i.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a){var e=a[d];if(!A(e,"-")&&i[e]!==c)return b=="pfx"?e:!0}return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+m.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+n.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.8.3",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j,k={}.toString,l="Webkit Moz O ms",m=l.split(" "),n=l.toLowerCase().split(" "),o={},p={},q={},r=[],s=r.slice,t,u=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=z(e[d],"function"),z(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=s.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(s.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(s.call(arguments)))};return e});for(var E in o)w(o,E)&&(t=E.toLowerCase(),e[t]=o[E](),r.push((e[t]?"":"no-")+t));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),h=j=null,e._version=d,e._domPrefixes=n,e._cssomPrefixes=m,e.hasEvent=u,e.testProp=function(a){return B([a])},e.testAllProps=D,e.prefixed=function(a,b,c){return b?D(a,b,c):D(a,"pfx")},e}(this,this.document);
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
