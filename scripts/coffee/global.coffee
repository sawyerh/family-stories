alphaWrap = document.querySelector('.alpha')
audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'))
betaWrap = document.querySelector('.beta')

contentElements = {
  "alpha": {
    wrap: alphaWrap
    bg: alphaWrap.querySelector('.bg')
    image: alphaWrap.querySelector('.image')
    map: alphaWrap.querySelector('.map')
    video: alphaWrap.querySelector('.video')
  }
  "beta": {
    wrap: betaWrap
    bg: betaWrap.querySelector('.bg')
    image: betaWrap.querySelector('.image')
    map: betaWrap.querySelector('.map')
    video: betaWrap.querySelector('.video')
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
  if visibleSet["wrap"].classList.contains('is-video')
    visibleSet["video"].play()

  # Preload and hide next content after current item's animationEnd
  $(visibleSet["wrap"]).on transitionEndEventName, ->
    $(visibleSet["wrap"]).off transitionEndEventName
    hiddenSet["wrap"].classList.remove('is-exiting')
    setMedia(hiddenSet, nextItem) if nextItem


initAudioPlayer = ->
  # Listen to the play progress
  audioPlayer.bind SC.Widget.Events.PLAY_PROGRESS, (data) ->
    console.log data.currentPosition

    if nextItem && data.currentPosition >= nextItem['start']
      console.log "Advance: #{data.currentPosition} >= #{nextItem['start']}"
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


goTo = (index) ->
  currentIndex = index - 1
  setMedia(hiddenSet, content[index])
  advanceShow()

  time = currentItem["start"]
  audioPlayer.play()

  window.setTimeout ->
    # Hack to get seekTo to work
    audioPlayer.seekTo(time)
  , 300


setMedia = (set, item) ->
  hasMap = false

  if item['image']
    set["bg"].src = item['image']

    if item['lat']
      hasMap = true
      initMap(set, item)
      set["map"].classList.remove('is-hidden')
      set["image"].classList.add('is-hidden')
    else
      set["image"].src = item['image']
      set["image"].classList.remove('is-hidden')

    set["bg"].classList.remove('is-hidden')
    set["video"].src = '' # stops the video from loading anymore
    set["video"].classList.add('is-hidden')
    set["wrap"].style['background'] = ''
    currentType = 'image'
  else if item['video']
    set["video"].src = item['video']
    set["video"].classList.remove('is-hidden')
    set["bg"].classList.add('is-hidden')
    set["image"].classList.add('is-hidden')
    set["wrap"].style['background'] = item['color']
    currentType = 'video'

  if !hasMap
    set["map"].classList.add('is-hidden')
    set["map"].innerHTML = ''

  removedType = if currentType == 'video' then 'image' else 'video'
  set["wrap"].classList.remove("is-#{removedType}")
  set["wrap"].classList.add("is-#{currentType}")


$ ->
  setMedia(visibleSet, content[0])
  setMedia(hiddenSet, content[1])
  initAudioPlayer()

  $('.start-button').on 'click', ->
    document.body.classList.remove('not-played')
    # goTo(2)
    audioPlayer.play()

  $(playToggle).on 'click', ->
    audioPlayer.toggle()