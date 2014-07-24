alphaWrap = document.querySelector('.alpha')
betaWrap = document.querySelector('.beta')
audioPlayer = SC.Widget(document.querySelector('.audio-player iframe'))

contentElements = {
  "alpha": {
    wrap: alphaWrap
    bg: alphaWrap.querySelector('.bg')
    image: alphaWrap.querySelector('.image')
    video: alphaWrap.querySelector('.video')
  }
  "beta": {
    wrap: betaWrap
    bg: betaWrap.querySelector('.bg')
    image: betaWrap.querySelector('.image')
    video: betaWrap.querySelector('.video')
  }
}

currentIndex = -1

if Modernizr.testProp('webkitAnimation')
  animationEndEventName = 'webkitAnimationEnd'
else if Modernizr.testProp('mozAnimation')
  animationEndEventName = 'mozAnimationEnd'
else
  animationEndEventName = 'animationEnd'


advanceShow = ->
  # Determine which elements hold the current content and
  # which elements to use for preloading the next content
  currentIndex += 1
  currentIndex = 0 if currentIndex >= content.length
  nextIndex = currentIndex + 1
  nextIndex = 0 if nextIndex >= content.length

  if contentElements["alpha"]["wrap"].classList.contains('is-active')
    currentSet = contentElements["beta"]
    nextSet = contentElements["alpha"]
  else
    currentSet = contentElements["alpha"]
    nextSet = contentElements["beta"]

  # Toggle visibility of sets
  currentSet["wrap"].classList.add('is-active')
  currentSet["wrap"].classList.add('fade-in')
  nextSet["wrap"].classList.add('is-exiting')
  nextSet["wrap"].classList.remove('is-active')

  # Play if video
  if currentSet["wrap"].classList.contains('is-video')
    currentSet["video"].play()

  # Preload and hide next content after current item's animationEnd
  $(currentSet["wrap"]).on animationEndEventName, ->
    $(currentSet["wrap"]).off animationEndEventName
    nextSet["wrap"].classList.remove('is-exiting')
    nextSet["wrap"].classList.remove('fade-in')
    setMedia(nextSet, content[nextIndex])


initAudioPlayer = ->
  # Listen to the play progress
  audioPlayer.bind SC.Widget.Events.PLAY_PROGRESS, (data) ->
    console.log data.currentPosition / 1000


setMedia = (set, item) ->
  if item['image']
    set["bg"].src = item['image']
    set["image"].src = item['image']
    set["bg"].classList.remove('is-hidden')
    set["image"].classList.remove('is-hidden')
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

  removedType = if currentType == 'video' then 'image' else 'video'
  set["wrap"].classList.remove("is-#{removedType}")
  set["wrap"].classList.add("is-#{currentType}")


$ ->
  setMedia(contentElements["alpha"], content[0])
  advanceShow()
  initAudioPlayer()

  $('.start-button').on 'click', ->
    body = document.body
    body.classList.remove('not-played')
    body.classList.add('playing')

  $(document).on 'click', '.image-wrap', ->
    advanceShow()