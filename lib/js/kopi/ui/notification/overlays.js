(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/notification/overlays", function(require, exports, module) {
    var Overlay, hide, i18n, instance, overlayInstance, settings, show, widgets;
    settings = require("kopi/settings");
    i18n = require("kopi/utils/i18n");
    widgets = require("kopi/ui/notification/widgets");
    Overlay = (function(_super) {

      __extends(Overlay, _super);

      function Overlay() {
        return Overlay.__super__.constructor.apply(this, arguments);
      }

      Overlay.widgetName("Overlay");

      Overlay.prototype.onskeleton = function() {
        this.element.bind("click", function(e) {
          e.preventDefault();
          return e.stopPropagation();
        });
        return Overlay.__super__.onskeleton.apply(this, arguments);
      };

      Overlay.prototype.show = function(options) {
        var cls, self;
        if (options == null) {
          options = {};
        }
        cls = this.constructor;
        self = this;
        if (!self.hidden) {
          self.element.toggleClass(cls.transparentClass(), options.transparent);
          return self;
        }
        self.hidden = false;
        self.element.addClass(cls.showClass());
        if (options.transparent) {
          self.element.addClass(cls.transparentClass());
        }
        return self;
      };

      Overlay.prototype.hide = function() {
        var cls, self;
        cls = this.constructor;
        self = this;
        if (self.hidden) {
          return self;
        }
        self.hidden = true;
        self.element.removeClass("" + (cls.showClass()) + " " + (cls.transparentClass()));
        return self;
      };

      return Overlay;

    })(widgets.Widget);
    overlayInstance = null;
    instance = function() {
      return overlayInstance || (overlayInstance = new Overlay().skeletonTo(document.body).render());
    };
    show = function() {
      var _ref;
      return (_ref = instance()).show.apply(_ref, arguments);
    };
    hide = function() {
      return instance().hide();
    };
    return {
      instance: instance,
      show: show,
      hide: hide,
      Overlay: Overlay
    };
  });

}).call(this);
