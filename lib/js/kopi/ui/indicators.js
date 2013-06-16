(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/indicators", function(require, exports, module) {
    var Indicator, Togglable, Widget, klass;
    klass = require("kopi/utils/klass");
    Togglable = require("kopi/ui/mixins/togglable").Togglable;
    Widget = require("kopi/ui/widgets").Widget;
    Indicator = (function(_super) {

      __extends(Indicator, _super);

      Indicator.widgetName("Indicator");

      klass.include(Indicator, Togglable);

      Indicator.configure({
        center: false
      });

      function Indicator() {
        var cls;
        Indicator.__super__.constructor.apply(this, arguments);
        if (this._options.center) {
          cls = this.constructor;
          this._options.extraClass += " " + (cls.cssClass("center"));
        }
        this.hidden = true;
      }

      Indicator.prototype.ondestroy = function() {
        return this.hidden = true;
      };

      return Indicator;

    })(Widget);
    return {
      Indicator: Indicator
    };
  });

}).call(this);
