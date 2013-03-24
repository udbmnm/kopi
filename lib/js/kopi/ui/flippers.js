(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/flippers", function(require, exports, module) {
    var Animation, Animator, Flippable, Flipper, FlipperAnimation, FlipperPage, Scrollable, Widget, klass, logger, logging, math, number;
    logging = require("kopi/logging");
    klass = require("kopi/utils/klass");
    number = require("kopi/utils/number");
    Animator = require("kopi/ui/animators").Animator;
    Animation = require("kopi/ui/animators/animations").Animation;
    Scrollable = require("kopi/ui/scrollable").Scrollable;
    Widget = require("kopi/ui/widgets").Widget;
    logger = logging.logger(module.id);
    math = Math;
    /*
      Scrollable widget for flipper. Snap to pages
    */

    Flippable = (function(_super) {

      __extends(Flippable, _super);

      Flippable.widgetName("Flippable");

      Flippable.configure({
        snap: true,
        scrollY: false
      });

      function Flippable(flipper, options) {
        var self;
        Flippable.__super__.constructor.call(this, options);
        self = this;
        self._flipper = flipper;
        self._currentPageX = 0;
        self._currentPageY = 0;
        if (!self._options.snap) {
          logger.warn("Make sure option 'snap' is set to true");
          self._options.snap = true;
        }
      }

      Flippable.prototype.onresize = function() {
        Flippable.__super__.onresize.apply(this, arguments);
        return this.pages();
      };

      /*
          Get snapping pages
      */


      Flippable.prototype.pages = function() {
        var i, left, page, pageOffset, self, top, wrapperOffset, _i, _len, _ref;
        self = this;
        self._pagesX = [];
        self._pagesY = [];
        wrapperOffset = self._container.position();
        _ref = this._flipper.children();
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          page = _ref[i];
          pageOffset = page.element.position();
          left = -pageOffset.left + wrapperOffset.left;
          top = -pageOffset.top + wrapperOffset.top;
          this._pagesX[i] = left < this._maxScrollX ? this._maxScrollX : left;
          this._pagesY[i] = top < this._maxScrollY ? this._maxScrollY : top;
        }
        return this;
      };

      Flippable.prototype._containerSize = function() {
        var flipper, height, options, width;
        options = this._options;
        flipper = this._flipper;
        width = flipper.width();
        height = flipper.height();
        this._containerWidth = options.scrollX ? width * flipper.children().length : this._elementWidth;
        this._containerHeight = options.scrollY ? height * flipper.children().length : this._elementHeight;
        this._container.width(this._containerWidth);
        this._container.height(this._containerHeight);
        return this;
      };

      /*
          Get position where container should snap to
      */


      Flippable.prototype._snapPosition = function(x, y, duration, reset) {
        var distX, distY, self, snap, threshold;
        if (reset == null) {
          reset = false;
        }
        self = this;
        threshold = self._options.snapThreshold;
        distX = x - self._absStartX;
        distY = y - self._absStartY;
        if (math.abs(distX) < threshold && math.abs(distY) < threshold) {
          x = self._absStartX;
          y = self._absStartY;
          duration = 200;
        } else {
          snap = reset ? self._snap(self._x, self._y) : self._snap(x, y);
          x = snap.x;
          y = snap.y;
          duration = math.max(snap.time, duration);
        }
        return self.scrollTo(math.round(x), math.round(y), duration);
      };

      Flippable.prototype._snap = function(x, y) {
        var i, page, self, sizeX, sizeY, time, _ref, _ref1;
        self = this;
        _ref = number.round(x, self._pagesX), page = _ref[0], i = _ref[1];
        if (i === self._currentPageX && i > 0 && self._directionX < 0) {
          i--;
          page = self._pagesX[i];
        }
        x = page;
        sizeX = math.abs(x - self._pagesX[self._currentPageX]);
        sizeX = sizeX ? math.abs(self._x - x) / sizeX * 500 : 0;
        self._currentPageX = i;
        _ref1 = number.round(y, self._pagesY), page = _ref1[0], i = _ref1[1];
        if (i === self._currentPageY && i > 0 && self._directionY < 0) {
          i--;
          page = self._pagesY[i];
        }
        y = page;
        sizeY = math.abs(y - self._pagesY[self._currentPageY]);
        sizeY = sizeY ? math.abs(self._y - y) / sizeY * 500 : 0;
        self._currentPageY = i;
        time = math.round(math.max(sizeX, sizeY)) || 200;
        return {
          x: x,
          y: y,
          time: time
        };
      };

      return Flippable;

    })(Scrollable);
    FlipperAnimation = (function(_super) {

      __extends(FlipperAnimation, _super);

      function FlipperAnimation() {
        FlipperAnimation.__super__.constructor.apply(this, arguments);
        this._flippable = this.animator.flippable();
      }

      FlipperAnimation.prototype.animate = function(from, to, options, fn) {};

      return FlipperAnimation;

    })(Animation);
    /*
      Child will be added to flipper
    */

    FlipperPage = (function(_super) {

      __extends(FlipperPage, _super);

      function FlipperPage() {
        return FlipperPage.__super__.constructor.apply(this, arguments);
      }

      FlipperPage.widgetName("FlipperPage");

      FlipperPage.prototype.onresize = function() {
        var flipper, height, width;
        flipper = this.end();
        width = flipper.width();
        height = flipper.height();
        if (width) {
          this.element.width(width);
        }
        if (height) {
          this.element.height(height);
        }
        return FlipperPage.__super__.onresize.apply(this, arguments);
      };

      return FlipperPage;

    })(Widget);
    /*
      A simple animator that will animate between two or more views added to it.
    */

    Flipper = (function(_super) {
      var proto;

      __extends(Flipper, _super);

      Flipper.widgetName("Flipper");

      Flipper.configure({
        childClass: FlipperPage
      });

      proto = Flipper.prototype;

      klass.accessor(proto, "width");

      klass.accessor(proto, "height");

      function Flipper() {
        var self;
        Flipper.__super__.constructor.apply(this, arguments);
        self = this;
        self._flippable = new Flippable(self, self._extractOptions("flippable"));
      }

      Flipper.prototype.onskeleton = function() {
        this._flippable.skeletonTo(this.element);
        return Flipper.__super__.onskeleton.apply(this, arguments);
      };

      Flipper.prototype.onrender = function() {
        this._flippable.render();
        return Flipper.__super__.onrender.apply(this, arguments);
      };

      Flipper.prototype.ondestroy = function() {
        this._flippable.destroy();
        return Flipper.__super__.ondestroy.apply(this, arguments);
      };

      Flipper.prototype.onresize = function() {
        var cls, flippable, page, _i, _len, _ref;
        Flipper.__super__.onresize.apply(this, arguments);
        cls = this.constructor;
        flippable = this._flippable;
        this._width = flippable.options().scrollX ? flippable.element.innerWidth() : '100%';
        this._height = flippable.options().scrollY ? flippable.element.innerWidth() : '100%';
        _ref = this._children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          page = _ref[_i];
          page.emit(cls.RESIZE_EVENT);
        }
        this._flippable.emit(cls.RESIZE_EVENT);
      };

      Flipper.prototype._wrapper = function() {
        return this._flippable.container();
      };

      Flipper.prototype.addAt = function() {
        var child;
        child = Flipper.__super__.addAt.apply(this, arguments);
        if (this._flippable.rendered) {
          this._flippable.pages();
        }
        return child;
      };

      Flipper.prototype.removeAt = function() {
        Flipper.__super__.removeAt.apply(this, arguments);
        if (this._flippable.rendered) {
          this._flippable.pages();
        }
        return this;
      };

      Flipper.prototype.empty = function() {
        Flipper.__super__.empty.apply(this, arguments);
        if (this._flippable.rendered) {
          this._flippable.pages();
        }
        return this;
      };

      return Flipper;

    })(Animator);
    return {
      FlipperAnimation: FlipperAnimation,
      FlipperPage: FlipperPage,
      Flipper: Flipper
    };
  });

}).call(this);
