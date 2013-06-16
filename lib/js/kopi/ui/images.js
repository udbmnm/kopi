(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/images", function(require, exports, module) {
    var $, IMG_TAG, Image, SRC, doc, settings, widgets;
    $ = require("jquery");
    widgets = require("kopi/ui/widgets");
    settings = require("kopi/settings");
    doc = document;
    IMG_TAG = "<img></img>";
    SRC = "src";
    /*
    A optimized image widget has following features.
    
    TODO Allow to retry if download fails
    TODO Image resources can be cached in db or localstorage as base64 string
    TODO Simple process image with canvas?
    TODO Do not subtitute image when page is scrolling
    */

    Image = (function(_super) {

      __extends(Image, _super);

      Image.IMAGE_LOAD_EVENT = "imageload";

      Image.IMAGE_ERROR_EVENT = "imageerror";

      Image.widgetName("Image");

      Image.configure({
        tagName: "figure",
        height: null,
        width: null,
        src: "" + settings.kopi.ui.imageDir + "/kopi/transparent.gif",
        loaderSrc: "",
        fallbackSrc: "",
        bordered: false
      });

      function Image() {
        Image.__super__.constructor.apply(this, arguments);
        if (this._options.bordered) {
          this._options.extraClasses += " " + (this.constructor.cssClass("bordered"));
        }
        this._src = this._options.src;
      }

      Image.prototype.image = function(src) {
        var self;
        self = this;
        self._src = src;
        if (self.rendered) {
          self.update();
        }
        return self;
      };

      Image.prototype.onskeleton = function() {
        var cls, options, self;
        self = this;
        cls = this.constructor;
        options = self._options;
        if (options.loaderSrc) {
          self.image = $(IMG_TAG, {
            src: options.loaderSrc
          });
          self.element.addClass(cls.cssClass("loading"));
        } else {
          self.image = $(IMG_TAG, {
            src: options.src
          });
          self.image.height(options.height);
          self.image.width(options.width);
        }
        self.element.width(options.width).height(options.height).html(self.image);
        return Image.__super__.onskeleton.apply(this, arguments);
      };

      Image.prototype.onrender = function() {
        this._draw();
        return Image.__super__.onrender.apply(this, arguments);
      };

      Image.prototype.onupdate = function() {
        this._draw();
        return Image.__super__.onupdate.apply(this, arguments);
      };

      /*
      Redraw image with given `src`
      */


      Image.prototype._draw = function() {
        var cls, element, fallbackClass, image, img, loadingClass, options, self;
        self = this;
        cls = this.constructor;
        options = this._options;
        element = self.element;
        image = self.image;
        if (options.loaderSrc) {
          loadingClass = cls.cssClass("loading");
          fallbackClass = cls.cssClass("fallback");
          element.addClass(loadingClass);
          if (options.fallbackSrc) {
            element.removeClass(fallbackClass);
          }
          image.attr(SRC, options.loaderSrc);
          img = doc.createElement("img");
          img.onload = function(e) {
            element.removeClass(loadingClass);
            image.data("original-width", img.width).data("original-height", img.height).height(options.height).width(options.width).attr(SRC, self._src);
            return self.emit(cls.IMAGE_LOAD_EVENT);
          };
          img.onerror = function(e) {
            element.removeClass(loadingClass);
            if (options.fallbackSrc) {
              element.addClass(fallbackClass);
              image.attr(SRC, options.fallbackSrc);
            } else {
              image.attr(SRC, self._src);
            }
            return self.emit(cls.IMAGE_ERROR_EVENT);
          };
          return img.src = self._src;
        } else {
          return self.image.attr(SRC, self._src);
        }
      };

      return Image;

    })(widgets.Widget);
    return {
      Image: Image
    };
  });

}).call(this);
