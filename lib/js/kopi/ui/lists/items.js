(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/lists/items", function(require, exports, module) {
    var BaseListItem, ListItem, NavListItem, app, buttons, lists, widgets;
    buttons = require("kopi/ui/buttons");
    widgets = require("kopi/ui/widgets");
    lists = require("kopi/ui/lists");
    app = require("kopi/app");
    /*
      Base class of list items
    */

    BaseListItem = (function(_super) {

      __extends(BaseListItem, _super);

      function BaseListItem(list, options) {
        BaseListItem.__super__.constructor.call(this, options);
        this.list = list;
      }

      return BaseListItem;

    })(widgets.Widget);
    /*
      A simple list item filled with button
    */

    ListItem = (function(_super) {

      __extends(ListItem, _super);

      ListItem.widgetName("ListItem");

      function ListItem(list, text) {
        ListItem.__super__.constructor.call(this, list);
        this.register("button", buttons.Button, {
          size: false,
          style: false,
          rounded: false,
          hasIcon: false
        });
        this._button.title(text);
      }

      return ListItem;

    })(BaseListItem);
    NavListItem = (function(_super) {

      __extends(NavListItem, _super);

      NavListItem.widgetName("NavListItem");

      function NavListItem(list, data) {
        var self;
        NavListItem.__super__.constructor.call(this, list, data[0]);
        self = this;
        self._url = data[1];
        self._button.on(buttons.Button.CLICK_EVENT, function() {
          return app.instance().load(self._url);
        });
      }

      return NavListItem;

    })(ListItem);
    return {
      BaseListItem: BaseListItem,
      ListItem: ListItem,
      NavListItem: NavListItem
    };
  });

}).call(this);
