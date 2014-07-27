alphaWrap = document.querySelector('.alpha')
audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'))
betaWrap = document.querySelector('.beta')
chaptersList = document.querySelector('.list')
contentElements = {
  "alpha": {
    wrap: alphaWrap
    bg: alphaWrap.querySelector('.bg')
    image: alphaWrap.querySelector('.image')
    map: alphaWrap.querySelector('.map')
    video: alphaWrap.querySelector('.video')
    videoFrame: alphaWrap.querySelector('.video-frame')
  }
  "beta": {
    wrap: betaWrap
    bg: betaWrap.querySelector('.bg')
    image: betaWrap.querySelector('.image')
    map: betaWrap.querySelector('.map')
    video: betaWrap.querySelector('.video')
    videoFrame: betaWrap.querySelector('.video-frame')
  }
}
currentIndex = 0
currentItem = content[currentIndex]

hiddenSet = contentElements["beta"]
nextItem = content[currentIndex + 1]
playToggle = document.querySelector('.play-toggle')
visibleSet = contentElements["alpha"]

if Modernizr.testProp('webkitAnimation')
  animationEndEventName = 'webkitAnimationEnd'
else if Modernizr.testProp('mozAnimation')
  animationEndEventName = 'mozAnimationEnd'
else
  animationEndEventName = 'animationEnd'

transitionEndEventNames = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'MozTransition'    : 'transitionend',
  'OTransition'      : 'oTransitionEnd',
  'msTransition'     : 'MSTransitionEnd',
  'transition'       : 'transitionend'
}
transitionEndEventName = transitionEndEventNames[Modernizr.prefixed('transition')]


# Toggles the visibility of the sets
# and preloads the next item after the transition
advanceShow = ->
  currentIndex += 1
  currentItem = content[currentIndex]
  nextIndex = currentIndex + 1

  if nextIndex < content.length
    nextItem = content[nextIndex]

  if alphaWrap.classList.contains('is-active')
    visibleSet = contentElements["beta"]
    hiddenSet = contentElements["alpha"]
  else
    visibleSet = contentElements["alpha"]
    hiddenSet = contentElements["beta"]

  # Toggle visibility of sets
  visibleSet["wrap"].classList.add('is-active')
  hiddenSet["wrap"].classList.add('is-exiting')
  hiddenSet["wrap"].classList.remove('is-active')

  # Play if video
  # if visibleSet["wrap"].classList.contains('is-video')
  #   visibleSet["video"].play()

  # Preload and hide next content after current item's animationEnd
  $(visibleSet["wrap"]).on transitionEndEventName, ->
    $(visibleSet["wrap"]).off transitionEndEventName
    hiddenSet["wrap"].classList.remove('is-exiting')
    setMedia(hiddenSet, nextItem) if nextItem


initAudioPlayer = ->
  # Listen to the play progress
  audioPlayer.bind SC.Widget.Events.PLAY_PROGRESS, (data) ->

    if nextItem && data.currentPosition >= nextItem['start']
      nextItem = null
      advanceShow()

  audioPlayer.bind SC.Widget.Events.PAUSE, ->
    document.body.classList.remove('playing')
    document.body.classList.add('paused')
    playToggle.innerHTML = 'play'

  audioPlayer.bind SC.Widget.Events.PLAY, ->
    document.body.classList.add('playing')
    document.body.classList.remove('paused')
    playToggle.innerHTML = 'pause'


initMap = (set, item) ->
  latLong = new google.maps.LatLng(item['lat'], item['long'])
  panoramaOptions = {
    position: latLong
    pov: {
      heading: item['heading']
      pitch: item['pitch']
    }
    zoom: 1
  }
  myPano = new google.maps.StreetViewPanorama(set["map"], panoramaOptions)
  myPano.setVisible true


getYoutubeIframe = (id) ->
  "<iframe width='420' height='315' src='//www.youtube.com/embed/#{id}?rel=0&loop=1&autoplay=1&controls=0&playsinline=1&modestbranding=1&playlist=#{id}' frameborder='0'></iframe>"

goTo = (index) ->
  currentIndex = index - 1
  setMedia(hiddenSet, content[index])
  advanceShow()

  time = currentItem["start"]
  audioPlayer.play()
  audioPlayer.seekTo(time)


setMedia = (set, item) ->
  hasMap = false

  set["bg"].src = item['image']

  if item['video']
    set["videoFrame"].innerHTML = getYoutubeIframe(item['youtube'])
    set["video"].classList.remove('is-hidden')
    set["image"].classList.add('is-hidden')
    set["wrap"].style['background'] = item['color']
    currentType = 'video'
  else if item['image']
    if item['lat']
      hasMap = true
      initMap(set, item)
      set["map"].classList.remove('is-hidden')
      set["image"].classList.add('is-hidden')
      currentType = 'map'
    else
      set["image"].src = item['image']
      set["image"].classList.remove('is-hidden')
      currentType = 'image'

    set["videoFrame"].innerHTML = '' # stops the video from loading anymore
    set["video"].classList.add('is-hidden')
    set["wrap"].style['background'] = ''

  if !hasMap
    set["map"].classList.add('is-hidden')
    set["map"].innerHTML = ''

  removedType = if currentType == 'video' then 'image' else 'video'

  for type in ["image", "map", "video"]
    if type != currentType
      set["wrap"].classList.remove("is-#{type}")

  set["wrap"].classList.add("is-#{currentType}")


toggleChapterList = ->
  chaptersList.classList.toggle('is-hidden')

  if chaptersList.classList.contains('is-hidden')
    $(window).off 'keyup.chapters'
  else
    $(window).on 'keyup.chapters', (e) ->
      toggleChapterList() if e.keyCode == 27 # esc


$ ->
  setMedia(visibleSet, content[0])
  setMedia(hiddenSet, content[1])
  initAudioPlayer()

  $('.intro').on 'click', ->
    document.body.classList.remove('not-played')
    audioPlayer.play()

  $(playToggle).on 'click', ->
    audioPlayer.toggle()

  $('.chapters-toggle').on 'click', ->
    toggleChapterList()

  $('.chapter-link').on 'click', ->
    index = this.getAttribute('data-index')
    toggleChapterList()
    document.body.classList.remove('not-played')
    goTo(index)

  # Check for blurred bg support
  if !(Modernizr['cssfilters'] || Modernizr['svgfilters'])
    document.body.classList.add('no-blur')

  # Play/pause shortcut
  $(window).on 'keyup.global', (e) ->
    if e.keyCode == 32 # space
      document.body.classList.remove('not-played')
      audioPlayer.toggle()