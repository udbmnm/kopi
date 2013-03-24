(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/tests/ui/touchable", function(require, exports, module) {
    var $, CustomGesture, Photo, PhotoGallery, Touchable, Widget, bubbles, css, events, g, math, number;
    $ = require("jquery");
    Touchable = require("kopi/ui/touchable").Touchable;
    Widget = require("kopi/ui/widgets").Widget;
    g = require("kopi/ui/gestures");
    bubbles = require("kopi/ui/notification/bubbles");
    events = require("kopi/utils/events");
    css = require("kopi/utils/css");
    number = require("kopi/utils/number");
    math = Math;
    CustomGesture = (function(_super) {

      __extends(CustomGesture, _super);

      function CustomGesture() {
        return CustomGesture.__super__.constructor.apply(this, arguments);
      }

      CustomGesture.configure({
        preventDefault: true,
        tapDistance: 20,
        tapInterval: 300,
        dragMinDistance: 20,
        swipeTime: 200
      });

      CustomGesture.prototype.ontouchstart = function(e) {
        e.preventDefault();
        e.stopPropagation();
        this._startEvent = e;
        this._startPos = this._getPosition(e);
        this._startTouches = this._getTouches(e);
        this._startTime = e.timeStamp;
        this._isTouched = true;
        this._isSingleTouched = this._startTouches === 1;
        if (this._isSingleTouched) {
          this._tapMoved = false;
          this._canBeDoubleTap = this._lastTapTime && (this._startTime - this._lastTapTime < this._options.tapInterval) && this._lastTapPos && (this._getDistance(this._lastTapPos, this._startPos).dist < this._options.tapDistance);
        } else {
          this._isFirstPinch = true;
          this._isPinched = false;
          this._isPinchEnd = false;
        }
        this._isFirstDrag = true;
        this._isDragged = false;
        this._isDragEnd = false;
        if (this._tapTimer) {
          clearTimeout(this._tapTimer);
          this._tapTimer = null;
        }
        e.center = this._getCenter(this._startPos);
        return this._widget.emit("touch", [e]);
      };

      CustomGesture.prototype.ontouchmove = function(e) {
        var angle, moveDistance, scale;
        if (!this._isTouched) {
          return false;
        }
        e.preventDefault();
        e.stopPropagation();
        this._moveEvent = e;
        this._movePos = this._getPosition(e);
        this._moveCenter = this._getCenter(this._movePos);
        this._isSingleTouched = this._startTouches === 1;
        moveDistance = this._getDistance(this._startPos, this._movePos);
        if (this._isSingleTouched) {
          if (!this._tapMoved) {
            if (moveDistance.dist > this._options.tapDistance) {
              this._tapMoved = true;
              this._canBeDoubleTap = false;
            }
          }
        } else {
          scale = this._getScale(this._startPos, this._movePos);
          e.center = this._moveCenter;
          e.scale = scale;
          if (this._isFirstPinch) {
            this._widget.emit("pinchstart", [e]);
            this._isFirstPinch = false;
          } else {
            this._widget.emit("pinchmove", [e]);
          }
          this._isPinched = true;
        }
        if (moveDistance.dist > this._options.dragMinDistance) {
          angle = this._getAngleByDistance(moveDistance);
          e.angle = angle;
          e.center || (e.center = this._moveCenter);
          e.direction = this._getDirection(angle);
          e.distance = moveDistance.dist;
          e.distanceX = moveDistance.distX;
          e.distanceY = moveDistance.distY;
          if (this._isFirstDrag) {
            this._widget.emit("dragstart", [e]);
            this._isFirstDrag = false;
          } else {
            this._widget.emit("dragmove", [e]);
          }
          this._isDragged = true;
          e.preventDefault();
          return e.stopPropagation();
        }
      };

      CustomGesture.prototype.ontouchend = function(e) {
        var angle, delayFn, endDistance, scale,
          _this = this;
        if (!this._isTouched) {
          return false;
        }
        e.preventDefault();
        e.stopPropagation();
        this._endEvent = e;
        this._endPos = this._movePos || this._startPos;
        this._endCenter = this._getCenter(this._endPos);
        this._endTime = e.timeStamp;
        if (this._isSingleTouched && !this._tapMoved) {
          delayFn = function() {
            _this._widget.emit((_this._canBeDoubleTap ? "doubletap" : "tap"), [e]);
            _this._tapTimer = null;
            _this._lastTapTime = null;
            return _this._lastTapPos = null;
          };
          this._tapTimer = setTimeout(delayFn, this._options.tapInterval);
          this._lastTapTime = this._endTime;
          this._lastTapPos = this._endPos;
          return;
        }
        if (this._endPos) {
          endDistance = this._getDistance(this._startPos, this._endPos);
        }
        if (this._isPinched && !this._isPinchEnd) {
          scale = this._getScale(this._startPos, this._endPos);
          e.center = this._endCenter;
          e.scale = scale;
          this._isPinchEnd = true;
          this._widget.emit("pinchend", [e]);
        }
        if (this._isDragged && !this._isDragEnd) {
          angle = this._getAngleByDistance(endDistance);
          e.angle = angle;
          e.center || (e.center = this._endCenter);
          e.direction = this._getDirection(angle);
          e.distance = endDistance.dist;
          e.distanceX = endDistance.distX;
          e.distanceY = endDistance.distY;
          if (this._endTime - this._startTime < this._options.swipeTime) {
            this._widget.emit("swipe", [e]);
            this._widget.emit("swipe" + e.direction, [e]);
          }
          this._isDragEnd = true;
          return this._widget.emit("dragend", [e]);
        }
      };

      CustomGesture.prototype.ontouchcancel = function(e) {
        return this.ontouchend(e);
      };

      return CustomGesture;

    })(g.Base);
    Photo = (function(_super) {

      __extends(Photo, _super);

      Photo.widgetName("Photo");

      Photo.configure({
        startX: 0,
        startY: 0,
        width: 0,
        height: 0
      });

      function Photo(image, options) {
        Photo.__super__.constructor.call(this, options);
        this.image = $(image);
        this.startX = this._options.startX;
        this.startY = this._options.startY;
        this.x = this._options.startX;
        this.y = this._options.startY;
        this.originalWidth = image.width / 2;
        this.originalHeight = image.height / 2;
        this.width = this._options.width;
        this.height = this._options.height;
      }

      Photo.prototype.onskeleton = function() {
        this.element.append(this.image);
        return Photo.__super__.onskeleton.apply(this, arguments);
      };

      Photo.prototype.onrender = function() {
        console.log("Resize to " + this.width + "x" + this.height + ". Move to " + this.startX + "," + this.startY);
        this.update(this.width, this.height, this.x, this.y);
        this.setAsActive();
        return Photo.__super__.onrender.apply(this, arguments);
      };

      Photo.prototype.update = function(width, height, x, y) {
        return this.image.width(this.width).height(this.height).translate(this.startX, this.startY);
      };

      /*
          检查如果照片移动到某个位置，照片是否应该被显示出来
      */


      Photo.prototype.shouldBeActive = function(pos) {
        var _ref;
        return (-this.width <= (_ref = pos.x + this.startX) && _ref < this.width * 2);
      };

      Photo.prototype.moveToPos = function(pos, isActivePhoto) {
        if (isActivePhoto == null) {
          isActivePhoto = false;
        }
        if (isActivePhoto) {
          this.setAsActive();
          this.element.translate(pos.x, pos.y);
        } else {
          this.setAsInactive();
        }
        this.x = pos.x;
        return this.y = pos.y;
      };

      Photo.prototype.setAsActive = function() {
        var cls;
        cls = this.constructor;
        this.element.addClass(cls.cssClass("active"));
        return this.isActive = true;
      };

      Photo.prototype.setAsInactive = function() {
        var cls;
        cls = this.constructor;
        this.element.removeClass(cls.cssClass("active"));
        return this.isActive = false;
      };

      return Photo;

    })(Widget);
    PhotoGallery = (function(_super) {

      __extends(PhotoGallery, _super);

      PhotoGallery.widgetName("PhotoGallery");

      PhotoGallery.configure({
        gestures: [CustomGesture],
        dragBounce: false,
        dragMomentum: false,
        dragDamping: 0.5,
        dragDeceleration: 0.006,
        dragInterval: 300,
        startX: 0,
        startY: 0,
        originX: 0,
        originY: 0
      });

      function PhotoGallery() {
        PhotoGallery.__super__.constructor.apply(this, arguments);
        this._x = this._options.startX;
        this._y = this._options.startY;
        this._originalWidth = 0;
        this._originalHeight = 0;
        this._scale = 1;
        this._photos = [];
      }

      PhotoGallery.prototype.onskeleton = function() {
        return PhotoGallery.__super__.onskeleton.apply(this, arguments);
      };

      PhotoGallery.prototype.onrender = function() {
        var _this = this;
        this._originalWidth = this.element.width();
        this._originalHeight = this.element.height();
        console.log("original size: " + this._originalWidth + "x" + this._originalHeight);
        $("img", this.element).each(function(i, img) {
          var options, photo;
          options = {
            startX: i * _this._originalWidth,
            startY: 0,
            width: _this._originalWidth,
            height: _this._originalHeight
          };
          photo = new Photo(img, options).skeletonTo(_this.element).render();
          return _this._photos.push(photo);
        });
        this._getDragRange();
        return PhotoGallery.__super__.onrender.apply(this, arguments);
      };

      PhotoGallery.prototype.ontap = function(e, event) {
        var bubble;
        console.log("Tap", event);
        bubble = bubbles.instance();
        if (bubble.hidden) {
          return bubble.show("Tapped");
        } else {
          return bubble.hide();
        }
      };

      PhotoGallery.prototype.ondoubletap = function(e, event) {
        return console.log("DoubleTap", event);
      };

      PhotoGallery.prototype.ontouch = function(e, event) {
        var matrix;
        this._pos = event.center;
        this._startTime = event.timeStamp;
        if (this._options.dragMomentum) {
          matrix = this.element.parseMatrix();
          if (matrix && (matrix.x !== this._x || matrix.y !== this._y)) {
            this.element.unbind(events.WEBKIT_TRANSITION_END_EVENT);
            this._steps = [];
            return this.moveToPos(matrix);
          }
        }
      };

      PhotoGallery.prototype.ondragstart = function(e, event) {
        var photo, pos, _i, _len, _ref;
        console.log("DragStart", event);
        pos = this._getDragPos(event);
        _ref = this._photos;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          photo = _ref[_i];
          if (photo.shouldBeActive(pos)) {
            photo.setAsActive();
          } else {
            photo.setAsInactive();
          }
        }
        return this.moveToPos(pos);
      };

      PhotoGallery.prototype.ondragmove = function(e, event) {
        var pos;
        console.log("DragMove", event);
        pos = this._getDragPos(event);
        this.moveToPos(pos);
        if (event.timeStamp - this._startTime > this._options.dragInterval) {
          return this._startTime = event.timeStamp;
        }
      };

      PhotoGallery.prototype.ondragend = function(e, event) {
        var momentum, pos;
        console.log("DragEnd", event);
        pos = this._getDragPos(event);
        momentum = {
          distX: 0,
          distY: 0,
          duration: 0
        };
        return this._resetPosition();
      };

      PhotoGallery.prototype.onswipeleft = function(e, event) {
        return console.log("SwipeLeft", event);
      };

      PhotoGallery.prototype.onswiperight = function(e, event) {
        return console.log("SwipeRight", event);
      };

      PhotoGallery.prototype.onpinchstart = function(e, event) {
        return console.log("PinchStart: " + event.scale);
      };

      PhotoGallery.prototype.onpinchmove = function(e, event) {
        return console.log("PinchChange: " + event.scale);
      };

      PhotoGallery.prototype.onpinchend = function(e, event) {
        return console.log("PinchEnd: " + event.scale);
      };

      PhotoGallery.prototype._resetPosition = function(duration) {
        var pos, resetX, resetY;
        if (duration == null) {
          duration = 0;
        }
        if ((this._minDragX != null) && (this._maxDragX != null)) {
          resetX = number.threshold(this._x, this._maxDragX, this._minDragX);
        } else {
          resetX = this._x;
        }
        if ((this._minDragY != null) && (this._maxDragY != null)) {
          resetY = number.threshold(this._y, this._maxDragY, this._minDragY);
        } else {
          resetY = this._y;
        }
        console.log("Drag range", this._minDragX, this._maxDragX, this._minDragY, this._maxDragY);
        console.log("Reset to position: " + resetX + ", " + resetY);
        if (resetX === this._x && resetY === this._y) {
          if (this._moved) {
            this._moved = false;
          }
          return;
        }
        pos = {
          x: resetX,
          y: resetY
        };
        return this.moveToPos(pos, true);
      };

      /*
          计算拖动的位置
      */


      PhotoGallery.prototype._getDragPos = function(event) {
        var deltaX, deltaY, newX, newY, options, pos;
        options = this._options;
        pos = event.center;
        deltaX = pos.x - this._pos.x;
        deltaY = pos.y - this._pos.y;
        newX = this._x + deltaX;
        newY = this._y + deltaY;
        this._pos = pos;
        this._directionX = deltaX === 0 ? 0 : -deltaX / math.abs(deltaX);
        this._directionY = deltaY === 0 ? 0 : -deltaY / math.abs(deltaY);
        if ((this._minDragX != null) && (this._maxDragX != null) && (this._minDragX < newX || newX < this._maxDragX)) {
          newX = options.dragBounce ? this._x + deltaX * options.damping : newX >= this._minDragX || this._maxDragX >= this._minDragX ? this._minDragX : this._maxDragX;
        }
        if ((this._minDragY != null) && (this._maxDragY != null) && (this._minDragY < newY || newY < this._maxDragY)) {
          newY = options.dragBounce ? this._y + deltaY * options.damping : newY >= this._minDragY || this._maxDragY >= this._minDragY ? this._minDragY : this._maxDragY;
        }
        return {
          x: newX,
          y: newY
        };
      };

      /*
          移动容器
      */


      PhotoGallery.prototype.moveToPos = function(pos, forceCheckActivity) {
        var i, photo, _i, _len, _ref, _results;
        if (forceCheckActivity == null) {
          forceCheckActivity = false;
        }
        console.log("Move to " + pos.x + ", " + pos.y);
        this._x = pos.x;
        this._y = pos.y;
        _ref = this._photos;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          photo = _ref[i];
          _results.push(photo.moveToPos(pos, (forceCheckActivity ? photo.shouldBeActive(pos) : photo.isActive)));
        }
        return _results;
      };

      /*
          找到当前显示的图片
      */


      PhotoGallery.prototype.findActiveImage = function() {};

      /*
          计算拖动范围
      */


      PhotoGallery.prototype._getDragRange = function() {
        var res;
        res = {};
        res.minX = this._minDragX = 0;
        res.minY = this._minDragY = 0;
        res.maxX = this._maxDragX = -this._originalWidth * (this._photos.length - 1);
        res.maxY = this._maxDragY = 0;
        return res;
      };

      /*
          计算缩放范围
      */


      PhotoGallery.prototype._getScaleRange = function() {
        var res;
        return res = {};
      };

      return PhotoGallery;

    })(Touchable);
    $(function() {
      return new PhotoGallery().skeleton("#container").render();
    });
  });

}).call(this);
