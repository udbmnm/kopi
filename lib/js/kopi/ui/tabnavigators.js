(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/tabnavigators", function(require, exports, module) {
    var Animator, TabNavigator, TabPanel, TabPanelAnimator, Widget, klass, tabs;
    klass = require("kopi/utils/klass");
    Widget = require("kopi/ui/widgets").Widget;
    tabs = require("kopi/ui/tabs");
    Animator = require("kopi/ui/animators").Animator;
    TabPanel = (function(_super) {

      __extends(TabPanel, _super);

      TabPanel.widgetName("TabPanel");

      klass.accessor(TabPanel.prototype, "key");

      function TabPanel(options) {
        TabPanel.__super__.constructor.call(this, options);
        this._key || (this._key = this.guid);
      }

      return TabPanel;

    })(Widget);
    TabPanelAnimator = (function(_super) {

      __extends(TabPanelAnimator, _super);

      function TabPanelAnimator() {
        return TabPanelAnimator.__super__.constructor.apply(this, arguments);
      }

      TabPanelAnimator.widgetName("TabPanelAnimator");

      TabPanelAnimator.configure({
        childClass: TabPanel
      });

      return TabPanelAnimator;

    })(Animator);
    /*
      A navigation tabview with a tabbar and a flipper for content
    */

    TabNavigator = (function(_super) {
      var kls;

      __extends(TabNavigator, _super);

      kls = TabNavigator;

      kls.TAB_BAR_POS_TOP = "top";

      kls.TAB_BAR_POS_RIGHT = "right";

      kls.TAB_BAR_POS_BOTTOM = "bottom";

      kls.TAB_BAR_POS_LEFT = "left";

      kls.widgetName("TabNavigator");

      kls.configure({
        tabBarPos: kls.TAB_BAR_POS_TOP,
        tabBarClass: tabs.TabBar,
        tabPanelClass: TabPanelAnimator
      });

      function TabNavigator() {
        var cls, options, self;
        TabNavigator.__super__.constructor.apply(this, arguments);
        self = this;
        cls = this.constructor;
        options = this._options;
        if (options.tabBarPos) {
          options.extraClass += " " + (cls.cssClass(options.tabBarPos));
        }
        if (options.tabBarPos === cls.TAB_BAR_POS_TOP || options.tabBarPos === cls.TAB_BAR_POS_LEFT) {
          this.register("tabBar", options.tabBarClass).register("tabPanel", options.tabPanelClass);
        } else {
          this.register("tabPanel", options.tabPanelClass).register("tabBar", options.tabBarClass);
        }
        this._tabBar.on(tabs.TabBar.SELECT_EVENT, function(e, tab) {
          return self._tabPanel.show(tab);
        });
      }

      TabNavigator.prototype.addTab = function(tab, options) {
        this._tabBar.add(tab, options);
        return this;
      };

      TabNavigator.prototype.addPanel = function(panel, options) {
        this._tabPanel.add(panel, options);
        return this;
      };

      return TabNavigator;

    })(Widget);
    return {
      TabPanel: TabPanel,
      TabPanelAnimator: TabPanelAnimator,
      TabNavigator: TabNavigator
    };
  });

}).call(this);
