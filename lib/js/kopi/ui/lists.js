(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/lists", function(require, exports, module) {
    var Group, List, NavList, items;
    Group = require("kopi/ui/groups").Group;
    items = require("kopi/ui/lists/items");
    List = (function(_super) {
      var kls;

      __extends(List, _super);

      function List() {
        return List.__super__.constructor.apply(this, arguments);
      }

      List.widgetName("List");

      kls = List;

      kls.configure({
        childClass: items.ListItem,
        striped: false,
        bordered: false
      });

      List.prototype.onskeleton = function() {
        var cls, options;
        options = this._options;
        cls = this.constructor;
        this.element.toggleClass(cls.cssClass("striped"), options.striped).toggleClass(cls.cssClass("bordered"), options.bordered);
        return List.__super__.onskeleton.apply(this, arguments);
      };

      return List;

    })(Group);
    NavList = (function(_super) {

      __extends(NavList, _super);

      function NavList() {
        return NavList.__super__.constructor.apply(this, arguments);
      }

      NavList.widgetName("NavList");

      NavList.configure({
        childClass: items.NavListItem,
        striped: true
      });

      return NavList;

    })(List);
    return {
      List: List,
      NavList: NavList
    };
  });

}).call(this);
