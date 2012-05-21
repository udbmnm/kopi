// Generated by CoffeeScript 1.3.1
(function() {

  define("kopi/utils/css", function(require, exports, module) {
    var $, browser, experimental, reMatrix, scale, scaleClose, scaleOpen, settings, support, text, transform, transitionDuration, translate, translateClose, translateOpen, vendorPrefix;
    $ = require("jquery");
    browser = require("kopi/utils/browser");
    support = require("kopi/utils/support");
    text = require("kopi/utils/text");
    settings = require("kopi/settings");
    vendorPrefix = browser.webkit ? "-webkit-" : browser.mozilla ? "-moz-" : browser.opera ? "-o-" : browser.msie ? "-ms-" : "";
    if (support.cssTransform3d) {
      translateOpen = "translate3d(";
      translateClose = ",0)";
      scaleOpen = "scale3d(";
      scaleClose = ",0)";
    } else {
      translateOpen = "translate(";
      translateClose = ")";
      scaleOpen = "scale(";
      scaleClose = ")";
    }
    /*
      Generate vender-specified style names
    */

    experimental = function(name) {
      return vendorPrefix + text.dasherize(name);
    };
    /*
      Some extra jQuery utilities for CSS-related properties
    
      Set duration for CSS3 transition
    */

    transitionDuration = experimental("transition-duration");
    $.fn.duration = function(duration) {
      if (duration == null) {
        duration = 0;
      }
      return this.css(transitionDuration, duration + "ms");
    };
    /*
      Set translate
    */

    translate = "" + translateOpen + "{x}px,{y}px" + translateClose;
    transform = experimental("transform");
    $.fn.translate = function(x, y) {
      if (x == null) {
        x = 0;
      }
      if (y == null) {
        y = 0;
      }
      if (support.cssTransform) {
        return this.css(transform, text.format(translate, {
          x: x,
          y: y
        }));
      } else {
        return this.css({
          left: x,
          top: y
        });
      }
    };
    scale = "" + scaleOpen + "{x},{y}" + scaleClose;
    $.fn.scale = function(x, y) {
      if (x == null) {
        x = 1;
      }
      if (y == null) {
        y = 1;
      }
      if (support.cssTransform) {
        this.css(transform, text.format(scale, {
          x: x,
          y: y
        }));
      }
      return this;
    };
    /*
      Parse css Matrix from element
    */

    reMatrix = /[^0-9-.,]/g;
    $.fn.parseMatrix = function() {
      var matrix;
      matrix = this.css(transform).replace(reMatrix, "").split(",");
      if (matrix.length >= 6) {
        return {
          x: parseInt(matrix[4]),
          y: parseInt(matrix[5])
        };
      }
    };
    $.fn.toggleDebug = function() {
      return this.toggleClass("kopi-debug", settings.kopi.debug);
    };
    return {
      experimental: experimental
    };
  });

}).call(this);