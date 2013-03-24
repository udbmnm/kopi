(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/animators", function(require, exports, module) {
    var Animator, animations, klass, switchers;
    klass = require("kopi/utils/klass");
    switchers = require("kopi/ui/switchers");
    animations = require("kopi/ui/animators/animations");
    Animator = (function(_super) {
      var kls;

      __extends(Animator, _super);

      kls = Animator;

      kls.widgetName("Animator");

      kls.configure({
        animationClass: animations.Animation
      });

      klass.accessor(Animator.prototype, "animation");

      function Animator() {
        Animator.__super__.constructor.apply(this, arguments);
        this._animation = new this._options.animationClass(this, this._extractOptions("animation"));
      }

      Animator.prototype.resetAnimation = function() {
        return this._animation = null;
      };

      Animator.prototype._switch = function(fromChild, toChild, options) {
        var animateFn, cls, self;
        cls = this.constructor;
        self = this;
        animateFn = function() {
          if (fromChild) {
            fromChild.element.removeClass(cls.cssClass("current"));
          }
          toChild.element.addClass(cls.cssClass("current"));
          self._currentKey = self._key(toChild);
          return self.unlock();
        };
        self.lock();
        self._animation.animate(fromChild, toChild, options, animateFn);
        return self;
      };

      Animator.prototype._appendChild = function(child) {
        return Animator.__super__._appendChild.apply(this, arguments);
      };

      return Animator;

    })(switchers.Switcher);
    return {
      Animator: Animator
    };
  });

}).call(this);
