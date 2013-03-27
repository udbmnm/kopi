(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/scrollable", function(require, exports, module) {
    var $, Scrollable, TRANSFORM, TRANSFORM_ORIGIN, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION, css, events, exceptions, klass, logger, logging, math, number, support, text, touchable;
    $ = require("jquery");
    exceptions = require("kopi/exceptions");
    logging = require("kopi/logging");
    events = require("kopi/utils/events");
    css = require("kopi/utils/css");
    klass = require("kopi/utils/klass");
    support = require("kopi/utils/support");
    text = require("kopi/utils/text");
    number = require("kopi/utils/number");
    touchable = require("kopi/ui/touchable");
    math = Math;
    logger = logging.logger(module.id);
    TRANSITION_PROPERTY = css.experimental("transition-property");
    TRANSITION_TIMING_FUNCTION = css.experimental("transition-timing-function");
    TRANSFORM_ORIGIN = css.experimental("transform-origin");
    TRANSFORM = css.experimental("transform");
    /*
    TODO Support legacy animation
    TODO Do not calculate data on axis not scrollable
    TODO Handle animation of X axis and Y axis independently
    */

    Scrollable = (function(_super) {
      var kls, proto;

      __extends(Scrollable, _super);

      kls = Scrollable;

      kls.widgetName("Scrollable");

      kls.CLICK_EVENT = "click";

      kls.RESIZE_EVENT = "resize";

      kls.TRANSITION_END_EVENT = "transitionend";

      kls.TRANSITION_PROPERTY_STYLE = css.experimental("transform");

      kls.TRANSITION_TIMING_FUNCTION_STYLE = "cubic-bezier(0.33,0.66,0.66,1)";

      kls.TRANSFORM_ORIGIN_STYLE = "0 0";

      kls.EVENT_NAMESPACE = "scrollable";

      kls.configure({
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0,
        scrollX: true,
        scrollY: true,
        bounce: true,
        momentum: true,
        damping: 0.5,
        deceleration: 0.0006,
        snap: false,
        snapThreshold: 1,
        throttle: 250
      });

      proto = kls.prototype;

      klass.reader(proto, "container");

      klass.reader(proto, "containerWidth");

      klass.reader(proto, "containerHeight");

      klass.reader(proto, "elementWidth");

      klass.reader(proto, "elementHeight");

      function Scrollable() {
        var options, self;
        Scrollable.__super__.constructor.apply(this, arguments);
        self = this;
        options = self._options;
        self._originX = options.originX;
        self._originY = options.originY;
        self._x = options.startX;
        self._y = options.startY;
      }

      Scrollable.prototype.scrollTo = function(x, y, duration) {
        var self, step;
        self = this;
        self._stopAnimation();
        step = {
          x: x,
          y: y,
          duration: duration || 0
        };
        self._steps.push(step);
        self._animate();
        return self;
      };

      Scrollable.prototype.onskeleton = function() {
        this._container || (this._container = this._ensureWrapper("container"));
        return Scrollable.__super__.onskeleton.apply(this, arguments);
      };

      Scrollable.prototype.onresize = function() {
        return this._elementSize()._containerSize()._scrollSize()._duration(0)._resetPosition(100);
      };

      Scrollable.prototype.ontouchstart = function(e, event) {
        var cls, matrix, options, point, self;
        cls = this.constructor;
        self = this;
        options = self._options;
        self._moved = false;
        self._animating = false;
        self._absStartX = self._startX = self._x;
        self._absStartY = self._startY = self._y;
        point = self._points(event);
        self._pointX = point.pageX;
        self._pointY = point.pageY;
        self._startTime = point.timeStamp || new Date().getTime();
        self._directionX = 0;
        self._directionY = 0;
        self._duration(0);
        if (self._options.momentum) {
          matrix = self._container.parseMatrix();
          if (matrix && (matrix.x !== self._x || matrix.y !== self._y)) {
            self._container.unbind(events.WEBKIT_TRANSITION_END_EVENT);
            self._steps = [];
            return self._position(matrix.x, matrix.y);
          }
        }
      };

      Scrollable.prototype.ontouchmove = function(e, event) {
        var deltaX, deltaY, newX, newY, options, point, self, timestamp;
        event.preventDefault();
        event.stopPropagation();
        self = this;
        options = self._options;
        point = self._points(event);
        deltaX = point.pageX - self._pointX;
        deltaY = point.pageY - self._pointY;
        newX = self._x + deltaX;
        newY = self._y + deltaY;
        self._pointX = point.pageX;
        self._pointY = point.pageY;
        timestamp = point.timeStamp || new Date().getTime();
        self._directionX = deltaX === 0 ? 0 : -deltaX / math.abs(deltaX);
        self._directionY = deltaY === 0 ? 0 : -deltaY / math.abs(deltaY);
        if ((self._minScrollX != null) && (self._maxScrollX != null) && (self._minScrollX < newX || newX < self._maxScrollX)) {
          newX = options.bounce ? self._x + deltaX * options.damping : newX >= self._minScrollX || self._maxScrollX >= self._minScrollX ? self._minScrollX : self._maxScrollX;
        }
        if ((self._minScrollY != null) && (self._maxScrollY != null) && (self._minScrollY < newY || newY < self._maxScrollY)) {
          newY = options.bounce ? self._y + deltaY * options.damping : newY >= self._minScrollY || self._maxScrollY >= self._minScrollY ? self._minScrollY : self._maxScrollY;
        }
        self._moved = true;
        self._position(newX, newY);
        if (timestamp - self._startTime > options.throttle) {
          self._startTime = timestamp;
          self._startX = self._x;
          return self._startY = self._y;
        }
      };

      Scrollable.prototype.ontouchend = function(e, event) {
        var cls, duration, momentum, newDuration, newX, newY, options, point, self;
        cls = this.constructor;
        self = this;
        point = self._points(event);
        if (!self._moved) {
          self.emit(cls.CLICK_EVENT, [event]);
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        options = self._options;
        momentum = {
          distX: 0,
          distY: 0,
          duration: 0
        };
        duration = (point.timeStamp || new Date().getTime()) - self._startTime;
        newX = self._x;
        newY = self._y;
        if (duration < options.throttle && options.momentum) {
          momentum = self._momentum(newX - self._startX, newY - self._startY, duration, (self._minScrollX != null ? self._minScrollX - self._x : null), (self._maxScrollX != null ? self._x - self._maxScrollX : null), (self._minScrollY != null ? self._minScrollY - self._y : null), (self._maxScrollY != null ? self._y - self._maxScrollY : null), (options.bounce ? self._elementWidth : 0), (options.bounce ? self._elementHeight : 0));
          newX = self._x + momentum.distX;
          newY = self._y + momentum.distY;
          if ((self._x > self._minScrollX && newX > self._minScrollX) || (self.x < self._maxScrollX && newX < self._maxScrollX)) {
            momentum.distX = 0;
          }
          if ((self._y > self._minScrollY && newY > self._minScrollY) || (self._y < self._maxScrollY && newY < self._maxScrollY)) {
            momentum.distY = 0;
          }
        }
        if (momentum.distX || momentum.distY) {
          newDuration = math.max(momentum.duration, 10);
          if (options.snap) {
            self._snapPosition(newX, newY, duration);
            return;
          }
          self.scrollTo(math.round(newX), math.round(newY), newDuration);
          return;
        }
        if (options.snap) {
          self._snapPosition(newX, newY, duration, true);
          return;
        }
        return self._resetPosition(200);
      };

      Scrollable.prototype.ontouchcancel = function() {
        return this.ontouchend.apply(this, arguments);
      };

      Scrollable.prototype.ontransitionend = function(e, event) {
        var cls, self;
        cls = this.constructor;
        self = this;
        self._container.unbind(events.WEBKIT_TRANSITION_END_EVENT);
        return self._animate();
      };

      /*
      Get size of element
      */


      Scrollable.prototype._elementSize = function() {
        var elementOffset, self;
        self = this;
        self._elementWidth = self.element.innerWidth();
        self._elementHeight = self.element.innerHeight();
        elementOffset = self.element.offset();
        self._elementOffsetLeft = -elementOffset.left;
        self._elementOffsetTop = -elementOffset.top;
        return self;
      };

      /*
      Calculate size of container
      */


      Scrollable.prototype._containerSize = function() {
        var child, children, containerHeight, containerWidth, self, _i, _j, _len, _len1;
        self = this;
        children = self._container.children();
        if (children.length > 0) {
          if (self._options.scrollX) {
            containerWidth = 0;
            for (_i = 0, _len = children.length; _i < _len; _i++) {
              child = children[_i];
              child = $(child);
              containerWidth += child.outerWidth();
            }
            self._container.width(containerWidth);
          } else {
            self._container.width(self._elementWidth);
          }
          if (self._options.scrollY) {
            containerHeight = 0;
            for (_j = 0, _len1 = children.length; _j < _len1; _j++) {
              child = children[_j];
              child = $(child);
              containerHeight += child.outerHeight();
            }
            self._container.height(containerHeight);
          } else {
            self._container.height(self._elementHeight);
          }
        }
        self._containerWidth = math.max(self._container.outerWidth(), self._elementWidth);
        self._containerHeight = math.max(self._container.outerHeight(), self._elementHeight);
        return self;
      };

      /*
      Calculate scroll size
      */


      Scrollable.prototype._scrollSize = function() {
        var self;
        self = this;
        self._minScrollX = 0;
        self._minScrollY = 0;
        self._maxScrollX = self._elementWidth - self._containerWidth;
        self._maxScrollY = self._elementHeight - self._containerHeight;
        self._scrollX = self._options.scrollX && self._maxScrollX < self._minScrollX;
        self._scrollY = self._options.scrollY && self._maxScrollY < self._minScrollY;
        self._directionX = 0;
        self._directionY = 0;
        return self;
      };

      Scrollable.prototype._position = function(x, y) {
        var cls, self;
        cls = this.constructor;
        self = this;
        x = self._scrollX ? x : 0;
        y = self._scrollY ? y : 0;
        self._container.translate(x, y);
        self._x = x;
        self._y = y;
        return self;
      };

      Scrollable.prototype._resetPosition = function(duration) {
        var resetX, resetY, self;
        if (duration == null) {
          duration = 0;
        }
        self = this;
        if ((self._minScrollX != null) && (self._maxScrollX != null)) {
          resetX = number.threshold(self._x, self._maxScrollX, self._minScrollX);
        } else {
          resetX = self._x;
        }
        if ((self._minScrollY != null) && (self._maxScrollY != null)) {
          resetY = number.threshold(self._y, self._maxScrollY, self._minScrollY);
        } else {
          resetY = self._y;
        }
        if (resetX === self._x && resetY === self._y) {
          if (self._moved) {
            self._moved = false;
          }
          return;
        }
        return self.scrollTo(resetX, resetY, duration);
      };

      Scrollable.prototype._animate = function() {
        var cls, self, startTime, startX, startY, step, transitionEndFn;
        cls = this.constructor;
        self = this;
        if (self._animating) {
          return;
        }
        if (!self._steps.length) {
          self._resetPosition(400);
          return self;
        }
        startX = self._x;
        startY = self._y;
        startTime = new Date().getTime();
        step = self._steps.shift();
        if (step.x === startX && step.y === startY) {
          step.duration = 0;
        }
        self._animating = true;
        self._moved = true;
        self._duration(step.duration)._position(step.x, step.y);
        self._animating = false;
        if (step.duration) {
          transitionEndFn = function(e) {
            e.preventDefault();
            e.stopPropagation();
            return self.emit(cls.TRANSITION_END_EVENT);
          };
          self._container.bind(events.WEBKIT_TRANSITION_END_EVENT, transitionEndFn);
        } else {
          self._resetPosition(0);
        }
        return self;
      };

      Scrollable.prototype._stopAnimation = function() {
        this._steps = [];
        this._moved = false;
        this._animating = false;
        return this;
      };

      /*
      Get position where container should snap to
      */


      Scrollable.prototype._snapPosition = function(x, y, duration, reset) {
        if (reset == null) {
          reset = false;
        }
        throw new exceptions.NotImplementedError();
      };

      /*
      Implement in subclasses
      */


      Scrollable.prototype._snap = function(x, y) {
        throw new exceptions.NotImplementedError();
      };

      /*
      Calculate momentum distance and duration
      */


      Scrollable.prototype._momentum = function(distX, distY, duration, minDistX, maxDistX, minDistY, maxDistY, sizeX, sizeY) {
        var deceleration, maxSpeed, newDistX, newDistY, newDuration, newSpeed, outsideDistX, self, speed, speedX, speedY, _ref, _ref1, _ref2, _ref3;
        self = this;
        speedX = math.abs(distX) / duration;
        speedY = math.abs(distY) / duration;
        speed = math.sqrt(math.pow(speedX, 2) + math.pow(speedY, 2));
        maxSpeed = math.sqrt(math.pow(self._containerWidth, 2) + math.pow(self._containerHeight, 2)) / 500;
        if (speed > maxSpeed) {
          newSpeed = maxSpeed;
          speedX = newSpeed / speed * speedX;
          speedY = newSpeed / speed * speedY;
          speed = newSpeed;
        }
        deceleration = self._options.deceleration;
        newDistX = math.pow(speedX, 2) / (2 * deceleration);
        newDistY = math.pow(speedY, 2) / (2 * deceleration);
        outsideDistX = 0;
        if ((minDistX != null) && distX > 0 && newDistX > minDistX) {
          _ref = self._outside(newDistX, speedX, sizeX, minDistX, deceleration), speedX = _ref[0], newDistX = _ref[1];
        }
        if ((maxDistX != null) && distX < 0 && newDistX > maxDistX) {
          _ref1 = self._outside(newDistX, speedX, sizeX, maxDistX, deceleration), speedX = _ref1[0], newDistX = _ref1[1];
        }
        if ((minDistY != null) && distY > 0 && newDistY > minDistY) {
          _ref2 = self._outside(newDistY, speedY, sizeY, minDistY, deceleration), speedY = _ref2[0], newDistY = _ref2[1];
        }
        if ((maxDistY != null) && distY < 0 && newDistY > maxDistY) {
          _ref3 = self._outside(newDistY, speedY, sizeY, maxDistY, deceleration), speedY = _ref3[0], newDistY = _ref3[1];
        }
        newDistX = math.min(200, newDistX) * (distX < 0 ? -1 : 1);
        newDistY = math.min(200, newDistY) * (distY < 0 ? -1 : 1);
        speed = math.min(1, math.sqrt(math.pow(speedX, 2) + math.pow(speedY, 2)));
        newDuration = math.min(speed / deceleration, 1000);
        return {
          distX: newDistX,
          distY: newDistY,
          duration: newDuration
        };
      };

      /*
      Re-calculate speed and distance if target is outside container
      */


      Scrollable.prototype._outside = function(distance, speed, size, maxDistance, deceleration) {
        var outsideDistance;
        outsideDistance = size / (6 / (distance / speed * deceleration));
        maxDistance = maxDistance + outsideDistance;
        speed = speed * maxDistance / distance;
        distance = maxDistance;
        return [speed, distance];
      };

      /*
      Set transition duration for container
      */


      Scrollable.prototype._duration = function(duration) {
        this._container.duration(duration);
        return this;
      };

      return Scrollable;

    })(touchable.Touchable);
    return {
      Scrollable: Scrollable
    };
  });

}).call(this);
