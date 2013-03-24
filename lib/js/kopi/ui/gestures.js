(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/gestures", function(require, exports, module) {
    var Base, EventEmitter, Pan, Pinch, Rotation, Tap, body, doc, klass, math, support, utils, win;
    EventEmitter = require("kopi/events").EventEmitter;
    klass = require("kopi/utils/klass");
    support = require("kopi/utils/support");
    utils = require("kopi/utils");
    win = window;
    doc = document;
    body = doc.body;
    math = Math;
    /*
      Base class for concrete gesture recognizer classes.
    
      A gesture recognizer decouples the logic for recognizing a gesture
      and acting on that recognition
    
      This is inspired by UIGestureRecognizer of iOS
    */

    Base = (function(_super) {

      __extends(Base, _super);

      Base.prefix = "gesture";

      Base.DIRECTION_UP = "up";

      Base.DIRECTION_DOWN = "down";

      Base.DIRECTION_LEFT = "left";

      Base.DIRECTION_RIGHT = "right";

      Base.STATE_POSSIBLE = 0;

      Base.STATE_RECOGNIZED = 1;

      Base.STATE_FAILED = 2;

      klass.configure(Base, {
        preventDefault: true,
        stopPropagation: false
      });

      function Base(widget, options) {
        var cls;
        if (options == null) {
          options = {};
        }
        cls = this.constructor;
        this.guid = utils.guid(cls.prefix);
        this._widget = widget;
        this.state = cls.STATE_POSSIBLE;
        this.configure(options);
      }

      Base.prototype.ontouchstart = function(e) {
        if (this._options.preventDefault) {
          e.preventDefault();
        }
        if (this._options.stopPropagation) {
          return e.stopPropagation();
        }
      };

      Base.prototype.ontouchmove = function(e) {
        if (this._options.preventDefault) {
          e.preventDefault();
        }
        if (this._options.stopPropagation) {
          return e.stopPropagation();
        }
      };

      Base.prototype.ontouchend = function(e) {
        if (this._options.preventDefault) {
          e.preventDefault();
        }
        if (this._options.stopPropagation) {
          return e.stopPropagation();
        }
      };

      Base.prototype.ontouchcancel = function(e) {
        return this.ontouchend.call(this, e);
      };

      /*
          calculate the angle between two points
      
          @param   object  posStart { x: int, y: int }
          @param   object  posMove { x: int, y: int }
      */


      Base.prototype._getAngle = function(posStart, posMove) {
        var distance;
        distance = this._getDistance(posStart, posMove);
        return this._getAngleByDistance(distance);
      };

      Base.prototype._getAngleByDistance = function(distance) {
        return math.atan2(distance.distY, distance.distX) * 180 / math.PI;
      };

      /*
          calculate the scale size between two fingers
          @param   object  posStart
          @param   object  posMove
          @return  float   scale
      */


      Base.prototype._getScale = function(posStart, posMove) {
        var endDistance, startDistance, x, y;
        if (posStart.length >= 2 && posMove.length >= 2) {
          x = posStart[0].x - posStart[1].x;
          y = posStart[0].y - posStart[1].y;
          startDistance = math.sqrt((x * x) + (y * y));
          x = posMove[0].x - posMove[1].x;
          y = posMove[0].y - posMove[1].y;
          endDistance = math.sqrt((x * x) + (y * y));
          return endDistance / startDistance;
        }
        return 0;
      };

      /*
          calculate mean center of multiple positions
      */


      Base.prototype._getCenter = function(positions) {
        var pos, sumX, sumY, _i, _len;
        sumX = 0;
        sumY = 0;
        for (_i = 0, _len = positions.length; _i < _len; _i++) {
          pos = positions[_i];
          sumX += pos.x;
          sumY += pos.y;
        }
        return {
          x: sumX / positions.length,
          y: sumY / positions.length
        };
      };

      /*
          calculate the rotation degrees between two fingers
          @param   object  posStart
          @param   object  posMove
          @return  float   rotation
      */


      Base.prototype._getRotation = function(posStart, posMove) {
        var endRotation, startRotation, x, y;
        if (posStart.length === 2 && posMove.length === 2) {
          x = posStart[0].x - posStart[1].x;
          y = posStart[0].y - posStart[1].y;
          startRotation = math.atan2(y, x) * 180 / math.PI;
          x = posMove[0].x - posMove[1].x;
          y = posMove[0].y - posMove[1].y;
          endRotation = math.atan2(y, x) * 180 / math.PI;
          return endRotation - startRotation;
        }
        return 0;
      };

      /*
          Get the angle to direction define
      
          @param {Number} angle
          @return {String} direction
      */


      Base.prototype._getDirection = function(angle) {
        var cls;
        cls = this.constructor;
        if (angle >= 45 && angle < 135) {
          return cls.DIRECTION_DOWN;
        } else if (angle >= 135 || angle <= -135) {
          return cls.DIRECTION_LEFT;
        } else if (angle < -45 && angle > -135) {
          return cls.DIRECTION_UP;
        } else {
          return cls.DIRECTION_RIGHT;
        }
      };

      /*
          Calculate average distance between to points
      
          @param {Object}  pos1 { x: int, y: int }
          @param {Object}  pos2 { x: int, y: int }
      */


      Base.prototype._getDistance = function(posStart, posMove) {
        var i, len, posMi, posSi, sum, sumX, sumY, x, y, _i;
        sumX = 0;
        sumY = 0;
        sum = 0;
        len = math.min(posStart.length, posMove.length);
        for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
          posSi = posStart[i];
          posMi = posMove[i];
          x = posMi.x - posSi.x;
          y = posMi.y - posSi.y;
          sumX += x;
          sumY += y;
          sum += math.sqrt(x * x + y * y);
        }
        return {
          distX: sumX / len,
          distY: sumY / len,
          dist: sum / len
        };
      };

      /*
          get the x and y positions from the event object
      
          @param {Event} event
          @return {Array}  [{ x: int, y: int }]
      */


      Base.prototype._getPosition = function(e) {
        var pos, touch, touches;
        if (!support.touch) {
          pos = [
            {
              x: e.pageX,
              y: e.pageY
            }
          ];
        } else {
          e = e ? e.originalEvent : win.event;
          touches = e.touches.length > 0 ? e.touches : e.changedTouches;
          pos = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = touches.length; _i < _len; _i++) {
              touch = touches[_i];
              _results.push({
                x: touch.pageX,
                y: touch.pageY
              });
            }
            return _results;
          })();
        }
        return pos;
      };

      /*
          Count the number of fingers in the event
          when no fingers are detected, one finger is returned (mouse pointer)
      
          @param {Event} event
          @return {Number}
      */


      Base.prototype._getTouches = function(e) {
        e = e ? e.originalEvent : win.event;
        if (e.touches) {
          return e.touches.length;
        } else {
          return 1;
        }
      };

      return Base;

    })(EventEmitter);
    /*
      Tap Gesture Recognizer
    */

    Tap = (function(_super) {

      __extends(Tap, _super);

      function Tap() {
        return Tap.__super__.constructor.apply(this, arguments);
      }

      Tap.TAP_START = "tapstart";

      Tap.TAP_EVENT = "tap";

      Tap.TAP_HOLD_EVENT = "taphold";

      Tap.TAP_RELEASE_EVENT = "taprelease";

      Tap.configure({
        minTaps: 1,
        minTouches: 1,
        movement: 20,
        timeout: 500
      });

      Tap.prototype.ontouchstart = function(e) {
        var pos;
        Tap.__super__.ontouchstart.apply(this, arguments);
        this._moved = false;
        this._holded = false;
        pos = this._position(e, false);
        this._posX = pos.x;
        this._posY = pos.y;
        this._widget.emit(this.constructor.TAP_START, [e]);
        return this._setHoldTimeout();
      };

      Tap.prototype.ontouchmove = function(e) {
        var deltaX, deltaY, pos, threshold;
        Tap.__super__.ontouchmove.apply(this, arguments);
        threshold = this._options.movement;
        pos = this._position(e, false);
        deltaX = pos.x - this._posX;
        deltaY = pos.y - this._posY;
        if (!this._moved && ((math.abs(deltaX) > threshold) || (math.abs(deltaY) > threshold))) {
          this._moved = true;
        }
        if (!this._holded) {
          return this._setHoldTimeout();
        }
      };

      Tap.prototype.ontouchend = function(e) {
        Tap.__super__.ontouchend.apply(this, arguments);
        this._clearHoldTimeout();
        this._widget.emit(this.constructor.TAP_RELEASE_EVENT);
        if (!this._holded && !this._moved) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          this._widget.emit(this.constructor.TAP_EVENT);
          return false;
        }
      };

      Tap.prototype._setHoldTimeout = function() {
        var holdFn,
          _this = this;
        if (this._holdTimer) {
          clearTimeout(this._holdTimer);
        }
        holdFn = function() {
          _this._holded = true;
          _this._widget.emit(_this.constructor.TAP_HOLD_EVENT);
          return _this._clearHoldTimeout();
        };
        return this._holdTimer = setTimeout(holdFn, this._options.timeout);
      };

      Tap.prototype._clearHoldTimeout = function() {
        if (this._holdTimer) {
          clearTimeout(this._holdTimer);
          return this._holdTimer = null;
        }
      };

      return Tap;

    })(Base);
    Pan = (function(_super) {

      __extends(Pan, _super);

      function Pan() {
        return Pan.__super__.constructor.apply(this, arguments);
      }

      return Pan;

    })(Base);
    Pinch = (function(_super) {

      __extends(Pinch, _super);

      function Pinch() {
        return Pinch.__super__.constructor.apply(this, arguments);
      }

      return Pinch;

    })(Base);
    Rotation = (function(_super) {

      __extends(Rotation, _super);

      function Rotation() {
        return Rotation.__super__.constructor.apply(this, arguments);
      }

      return Rotation;

    })(Base);
    return {
      Base: Base,
      Tap: Tap,
      Pan: Pan,
      Pinch: Pinch,
      Rotation: Rotation
    };
  });

}).call(this);
