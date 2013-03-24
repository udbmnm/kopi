(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/animators/animations", function(require, exports, module) {
    var Animation, EventEmitter, exceptions, klass;
    EventEmitter = require("kopi/events").EventEmitter;
    klass = require("kopi/utils/klass");
    exceptions = require("kopi/exceptions");
    /*
      Interface of animation
    */

    Animation = (function(_super) {
      var kls;

      __extends(Animation, _super);

      kls = Animation;

      klass.configure(kls, {
        name: "animation",
        duration: 300
      });

      kls.ANIMATION_READY_EVENT = "animationready";

      kls.ANIMATION_START_EVENT = "animationstart";

      kls.ANIMATION_END_EVENT = "animationend";

      function Animation(animator, options) {
        this.animator = animator;
        this.configure(options);
      }

      /*
          Main method to animate the UI components
      */


      Animation.prototype.animate = function(from, to, options, fn) {
        var animationClass, animationReverseClass, animatorClass, animatorElement, cls, endTransitionFn, fromElement, fromStartClass, fromStopClass, isReverse, self, startTransitionFn, toClass, toElement, toStartClass, toStopClass;
        if (options == null) {
          options = {};
        }
        cls = this.constructor;
        self = this;
        toClass = to.constructor;
        if (!from) {
          to.element.addClass(toClass.cssClass("show"));
          if (fn) {
            fn(null);
          }
          return;
        }
        isReverse = options.reverse;
        animatorClass = self.animator.constructor;
        animatorElement = self.animator.element;
        fromElement = from.element;
        toElement = to.element;
        fromStartClass = toClass.cssClass("from-start");
        toStartClass = toClass.cssClass("to-start");
        fromStopClass = toClass.cssClass("from-stop");
        toStopClass = toClass.cssClass("to-stop");
        animationClass = animatorClass.cssClass(self._options.name);
        animationReverseClass = animatorClass.cssClass("" + self._options.name + "-reverse");
        animatorElement.addClass(animationClass);
        if (isReverse) {
          animatorElement.addClass(animationReverseClass);
        }
        fromElement.addClass(fromStartClass);
        toElement.addClass(toStartClass);
        self.emit(cls.ANIMATION_READY_EVENT, [from, to, options]);
        startTransitionFn = function() {
          fromElement.addClass(fromStopClass);
          toElement.addClass(toStopClass);
          self.emit(cls.ANIMATION_START_EVENT, [from, to, options]);
          return setTimeout(endTransitionFn, self._options.duration + 50);
        };
        endTransitionFn = function() {
          self.emit(cls.ANIMATION_END_EVENT, [from, to, options]);
          toElement.addClass(toClass.cssClass("show"));
          fromElement.removeClass(toClass.cssClass("show"));
          animatorElement.removeClass("" + animationClass + " " + animationReverseClass);
          toElement.removeClass("" + toStartClass + " " + toStopClass);
          fromElement.removeClass("" + fromStartClass + " " + fromStopClass);
          if (fn) {
            return fn(null);
          }
        };
        setTimeout(startTransitionFn, 100);
        return self;
      };

      return Animation;

    })(EventEmitter);
    return {
      Animation: Animation
    };
  });

}).call(this);
