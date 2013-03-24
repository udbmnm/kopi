(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/tabs", function(require, exports, module) {
    var DuplicateTabKeyError, ScrollableTabBar, Tab, TabBar, TabIndexError, array, buttons, exceptions, groups, klass, logger, logging, scrollable, text, widgets;
    exceptions = require("kopi/exceptions");
    logging = require("kopi/logging");
    array = require("kopi/utils/array");
    klass = require("kopi/utils/klass");
    text = require("kopi/utils/text");
    buttons = require("kopi/ui/buttons");
    groups = require("kopi/ui/groups");
    widgets = require("kopi/ui/widgets");
    scrollable = require("kopi/ui/scrollable");
    logger = logging.logger(module.id);
    /*
      Tab errors
    */

    DuplicateTabKeyError = (function(_super) {

      __extends(DuplicateTabKeyError, _super);

      function DuplicateTabKeyError(key) {
        DuplicateTabKeyError.__super__.constructor.call(this, "Key has already used in tab bar: '" + key + "'");
      }

      return DuplicateTabKeyError;

    })(exceptions.ValueError);
    TabIndexError = (function(_super) {

      __extends(TabIndexError, _super);

      function TabIndexError(index) {
        TabIndexError.__super__.constructor.call(this, "Tab is not found in tab bar: " + index);
      }

      return TabIndexError;

    })(exceptions.ValueError);
    /*
      Tab
    */

    Tab = (function(_super) {
      var kls;

      __extends(Tab, _super);

      kls = Tab;

      kls.SELECT_EVENT = "select";

      kls.UNSELECT_EVENT = "unselect";

      kls.widgetName("Tab");

      kls.configure({
        hasIcon: true,
        iconWidth: 24,
        iconHeight: 24,
        iconPos: Tab.ICON_POS_TOP
      });

      klass.accessor(kls.prototype, "key");

      function Tab(options) {
        Tab.__super__.constructor.call(this, options);
        this._key || (this._key = this.guid);
        this._selected = false;
      }

      Tab.prototype.select = function() {
        var cls, self;
        cls = this.constructor;
        self = this;
        if (self._selected) {
          return self;
        }
        self.element.addClass(cls.cssClass("selected"));
        self._selected = true;
        return self.emit(cls.SELECT_EVENT);
      };

      Tab.prototype.unselect = function() {
        var cls, self;
        cls = this.constructor;
        self = this;
        if (!self._selected) {
          return self;
        }
        self.element.removeClass(cls.cssClass("selected"));
        self._selected = false;
        return self.emit(cls.UNSELECT_EVENT);
      };

      Tab.prototype.onclick = function() {
        return this._tabBar.select(this._key);
      };

      return Tab;

    })(buttons.Button);
    /*
      Tab bar contains multiple tabs
    
      TODO Inherit from some button group
    */

    TabBar = (function(_super) {
      var kls;

      __extends(TabBar, _super);

      kls = TabBar;

      kls.widgetName("TabBar");

      kls.LAYOUT_HORIZONTAL = "horizontal";

      kls.LAYOUT_VERTICAL = "vertical";

      kls.STYLE_FIXED = "fixed";

      kls.STYLE_FLEX = "flex";

      kls.STYLE_EVEN = "even";

      kls.SELECT_EVENT = "select";

      kls.ADD_EVENT = "add";

      kls.REMOVE_EVENT = "remove";

      kls.configure({
        childClass: Tab,
        layout: kls.LAYOUT_HORIZONTAL,
        style: kls.STYLE_EVEN,
        width: null,
        height: null
      });

      klass.accessor(TabBar, "tabs", {
        name: "children"
      });

      /*
          @param  {Array}   tabs    Array of name/value pair
          @param  {Hash}    options
      */


      function TabBar(options) {
        var cls;
        TabBar.__super__.constructor.apply(this, arguments);
        cls = this.constructor;
        this._selectedIndex = -1;
        this._options.extraClass += " " + (cls.cssClass(this._options.layout)) + " " + (cls.cssClass(this._options.style));
      }

      TabBar.prototype._wrapper = function() {
        return this.element;
      };

      /*
          Select a tab as if clicked.
      */


      TabBar.prototype.select = function(key) {
        var i, index, self, tab, _i, _len, _ref;
        self = this;
        index = array.indexOf(self._keys, key);
        self._selectedIndex = index;
        _ref = self._children;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          tab = _ref[i];
          if (i === index) {
            tab.select();
          } else {
            tab.unselect();
          }
        }
        return self.emit(self.constructor.SELECT_EVENT, [key]);
      };

      TabBar.prototype.onskeleton = function() {
        var cls, options, self, tabBarStyle;
        cls = this.constructor;
        self = this;
        options = self._options;
        if (options.layout === cls.LAYOUT_VERTICAL) {
          tabBarStyle = "height";
        } else {
          tabBarStyle = "width";
        }
        switch (options.style) {
          case cls.STYLE_EVEN:
            self._skeletonEvenTabs(tabBarStyle);
            break;
          case cls.STYLE_FIXED:
            self._skeletonFixedTabs(tabBarStyle);
            break;
          case cls.STYLE_FLEX:
            self._skeletonFlexTabs(tabBarStyle);
            break;
          default:
            throw new exceptions.ValueError("Unknown tab style: " + options.style);
        }
        return TabBar.__super__.onskeleton.apply(this, arguments);
      };

      TabBar.prototype._skeletonEvenTabs = function(style) {
        var element, self, tab, tabElement, tabsCount, _i, _len, _ref;
        self = this;
        element = self._wrapper();
        tabsCount = self._children.length;
        _ref = self._children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tab = _ref[_i];
          tabElement = self._skeletonTab(element, tab);
          tabElement.css(style, "" + (100 / tabsCount) + "%");
        }
        return self;
      };

      TabBar.prototype._skeletonFixedTabs = function(style) {
        var element, options, outerStyle, self, tab, tabBarSize, tabElement, tabSize, _i, _len, _ref;
        self = this;
        options = self._options;
        element = self._wrapper();
        tabBarSize = 0;
        tabSize = parseInt(self._options[style]);
        outerStyle = "outer" + text.capitalize(style);
        _ref = self._children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tab = _ref[_i];
          tabElement = self._skeletonTab(element, tab);
          tabElement[style](tabSize);
          tabBarSize += tabElement[outerStyle]();
        }
        element[style](tabBarSize);
        return self;
      };

      TabBar.prototype._skeletonFlexTabs = function(style) {
        var element, outerStyle, self, tab, tabBarSize, tabElement, _i, _len, _ref;
        self = this;
        element = self._wrapper();
        tabBarSize = 0;
        outerStyle = "outer" + text.capitalize(style);
        _ref = self._children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tab = _ref[_i];
          tabElement = self._skeletonTab(element, tab);
          tabBarSize += tabElement[outerStyle]();
        }
        element[style](tabBarSize);
        return self;
      };

      TabBar.prototype._skeletonTab = function(element, tab) {
        return tab.skeleton().element.appendTo(element);
      };

      TabBar.prototype._key = function(tab) {
        return tab.key();
      };

      TabBar.prototype.onrender = function() {
        var self, tab, _i, _len, _ref;
        self = this;
        _ref = self._children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tab = _ref[_i];
          tab.render();
        }
        return TabBar.__super__.onrender.apply(this, arguments);
      };

      return TabBar;

    })(groups.Group);
    /*
      A scrollable tab bar looks like Google News app on Android (horizontal)
      or bookmark panel of Firefox (vertical)
    */

    ScrollableTabBar = (function(_super) {
      var kls, proto;

      __extends(ScrollableTabBar, _super);

      kls = ScrollableTabBar;

      kls.widgetName("ScrollableTabBar");

      kls.configure({
        scrollableClass: scrollable.Scrollable
      });

      proto = kls.prototype;

      klass.accessor(proto, "scrollable");

      function ScrollableTabBar() {
        var options, scrollableOptions, self;
        ScrollableTabBar.__super__.constructor.apply(this, arguments);
        self = this;
        options = self._options;
        scrollableOptions = self._extractOptions("scrollable");
        self._scrollable = new options.scrollableClass(scrollableOptions).end(self);
      }

      ScrollableTabBar.prototype.onskeleton = function() {
        this._scrollable.skeleton().element.appendTo(this.element);
        return ScrollableTabBar.__super__.onskeleton.apply(this, arguments);
      };

      ScrollableTabBar.prototype.onrender = function() {
        this._scrollable.render();
        return ScrollableTabBar.__super__.onrender.apply(this, arguments);
      };

      ScrollableTabBar.prototype.ondestroy = function() {
        this._scrollable.destroy();
        return ScrollableTabBar.__super__.ondestroy.apply(this, arguments);
      };

      ScrollableTabBar.prototype._wrapper = function() {
        return this._scrollable.container();
      };

      return ScrollableTabBar;

    })(TabBar);
    return {
      Tab: Tab,
      TabBar: TabBar,
      ScrollableTabBar: ScrollableTabBar
    };
  });

}).call(this);
