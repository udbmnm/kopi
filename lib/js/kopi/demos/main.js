(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/demos/main", function(require, exports, module) {
    var DemoApp, Navbar, ViewSwitcher, app;
    app = require("kopi/app");
    Navbar = require("kopi/ui/navigation").Navbar;
    ViewSwitcher = require("kopi/ui/viewswitchers").ViewSwitcher;
    require("kopi/demos/routes");
    require("kopi/demos/settings");
    DemoApp = (function(_super) {

      __extends(DemoApp, _super);

      function DemoApp() {
        return DemoApp.__super__.constructor.apply(this, arguments);
      }

      DemoApp.prototype.onstart = function() {
        DemoApp.__super__.onstart.apply(this, arguments);
        this.navbar = new Navbar({
          position: Navbar.POS_TOP_FIXED
        }).skeletonTo(this.viewport.element).render();
        return this.viewSwitcher = new ViewSwitcher().skeletonTo(this.viewport.element).render();
      };

      DemoApp.prototype.onstop = function() {
        DemoApp.__super__.onstop.apply(this, arguments);
        this.navbar.destroy();
        return this.viewSwitcher.destroy();
      };

      return DemoApp;

    })(app.App);
    return $(function() {
      return new DemoApp().start();
    });
  });

}).call(this);
