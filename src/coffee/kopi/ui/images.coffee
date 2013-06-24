define "kopi/ui/images", (require, exports, module) ->

  $ = require "jquery"
  widgets = require "kopi/ui/widgets"
  settings = require "kopi/settings"

  doc = document
  IMG_TAG = "<img></img>"
  SRC = "src"

  ###
  A optimized image widget has following features.

  TODO Allow to retry if download fails
  TODO Image resources can be cached in db or localstorage as base64 string
  TODO Simple process image with canvas?
  TODO Do not subtitute image when page is scrolling
  ###
  class Image extends widgets.Widget

    this.IMAGE_LOAD_EVENT = "imageload"
    this.IMAGE_ERROR_EVENT = "imageerror"

    this.widgetName "Image"

    this.configure
      tagName: "figure"
      height: null
      width: null
      src: "#{settings.kopi.ui.imageDir}/kopi/transparent.gif"
      loaderSrc: ""
      fallbackSrc: ""
      bordered: false

    constructor: ->
      super
      if this._options.bordered
        this._options.extraClasses += " #{this.constructor.cssClass("bordered")}"
      this._src = this._options.src

    updateImageURL: (src) ->
      self = this
      self._src = src
      self.update() if self.rendered
      self

    onskeleton: ->
      self = this
      cls = this.constructor
      options = self._options
      # Show loader or default image when resource is not ready
      if options.loaderSrc
        self.image = $ IMG_TAG, src: options.loaderSrc
        self.element.addClass cls.cssClass("loading")
      else
        self.image = $(IMG_TAG, src: options.src)
        self.image.height(options.height)
        self.image.width(options.width)
      self.element
        .width(options.width)
        .height(options.height)
        .html(self.image)
      super

    onrender: ->
      this._draw()
      super

    onupdate: ->
      this._draw()
      super

    ###
    Redraw image with given `src`
    ###
    _draw: ->
      self = this
      cls = this.constructor
      options = this._options
      element = self.element
      image = self.image
      if options.loaderSrc
        loadingClass = cls.cssClass("loading")
        fallbackClass = cls.cssClass("fallback")

        element.addClass(loadingClass)
        element.removeClass(fallbackClass) if options.fallbackSrc
        image.attr(SRC, options.loaderSrc)

        img = doc.createElement("img")
        img.onload = (e) ->
          element.removeClass(loadingClass)
          # Save original width of image
          image
            .data("original-width", img.width)
            .data("original-height", img.height)
            .height(options.height)
            .width(options.width)
            .attr(SRC, self._src)
          self.emit(cls.IMAGE_LOAD_EVENT)
        img.onerror = (e) ->
          element.removeClass(loadingClass)
          if options.fallbackSrc
            element.addClass(fallbackClass)
            image.attr(SRC, options.fallbackSrc)
          else
            image.attr(SRC, self._src)
          self.emit(cls.IMAGE_ERROR_EVENT)
        img.src = self._src
      else
        self.image.attr SRC, self._src

  Image: Image
