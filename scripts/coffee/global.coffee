alphaWrap = document.querySelector('.alpha')
betaWrap = document.querySelector('.beta')

contentElements = {
  "alpha": {
    wrap: alphaWrap
    bg: alphaWrap.querySelector('.bg')
    image: alphaWrap.querySelector('.image')
  }
  "beta": {
    wrap: betaWrap
    bg: betaWrap.querySelector('.bg')
    image: betaWrap.querySelector('.image')
  }
}

# This'll be moved to an individual file eventually
content = [{
  image: "assets/1.jpg"
},{
  image: "assets/2.jpg"
}]

currentIndex = -1

if Modernizr.testProp('webkitAnimation')
  animationEndEventName = 'webkitAnimationEnd'
else if Modernizr.testProp('mozAnimation')
  animationEndEventName = 'mozAnimationEnd'
else
  animationEndEventName = 'animationEnd'

isAlpha = (index) ->
  index% 2 == 0

advanceShow = ->
  # Determine which elements hold the current content and
  # which elements to use for preloading the next content
  currentIndex += 1
  currentIndex = 0 if currentIndex >= content.length
  nextIndex = currentIndex + 1
  nextIndex = 0 if nextIndex >= content.length
  currentSet = if isAlpha(currentIndex) then contentElements["alpha"] else contentElements["beta"]
  nextSet = if isAlpha(currentIndex) then contentElements["beta"] else contentElements["alpha"]

  currentSet["bg"].src = content[currentIndex].image
  currentSet["image"].src = content[currentIndex].image
  currentSet["wrap"].classList.add('is-active')
  currentSet["wrap"].classList.add('fade-in')
  nextSet["wrap"].classList.add('is-exiting')
  nextSet["wrap"].classList.remove('is-active')

  # Preload and hide next content after current item's animationEnd
  $(currentSet["wrap"]).on animationEndEventName, ->
    $(currentSet["wrap"]).off animationEndEventName
    nextSet["wrap"].classList.remove('is-exiting')
    nextSet["wrap"].classList.remove('fade-in')
    nextSet["bg"].src = content[nextIndex].image
    nextSet["image"].src = content[nextIndex].image


$ ->
  advanceShow()

  $(document).on 'click', '.image-wrap', ->
    advanceShow()