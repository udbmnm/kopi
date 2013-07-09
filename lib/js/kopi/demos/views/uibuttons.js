(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/demos/views/uibuttons", function(require, exports, module) {
    var Button, Group, UIButtonView, View, capitalize, navigation, reverse, templates, viewswitchers;
    View = require("kopi/views").View;
    navigation = require("kopi/ui/navigation");
    viewswitchers = require("kopi/ui/viewswitchers");
    reverse = require("kopi/app/router").reverse;
    templates = require("kopi/demos/templates/uibuttons");
    Button = require("kopi/ui/buttons").Button;
    Group = require("kopi/ui/groups").Group;
    capitalize = require("kopi/utils/text").capitalize;
    UIButtonView = (function(_super) {

      __extends(UIButtonView, _super);

      UIButtonView.prototype.styles = ["default", "primary", "info", "success", "warning", "danger", "inverse"];

      UIButtonView.prototype.sizes = ["large", "normal", "small", "mini"];

      function UIButtonView() {
        var backButton, button, size, style, _i, _j, _len, _len1, _ref, _ref1;
        UIButtonView.__super__.constructor.apply(this, arguments);
        backButton = new navigation.NavButton({
          url: reverse("ui"),
          titleText: "Back"
        });
        this.nav = new navigation.Nav({
          title: "Buttons",
          leftButton: backButton
        });
        this.view = new viewswitchers.View({
          template: templates.buttons
        });
        this.styleGroup = new Group();
        _ref = this.styles;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          style = _ref[_i];
          button = new Button({
            titleText: capitalize(style),
            style: style
          });
          this.styleGroup.add(button);
        }
        this.sizeGroup = new Group();
        _ref1 = this.sizes;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          size = _ref1[_j];
          button = new Button({
            titleText: capitalize(size),
            size: size
          });
          this.sizeGroup.add(button);
        }
      }

      UIButtonView.prototype.oncreate = function() {
        this.app.navbar.add(this.nav);
        this.nav.skeleton();
        this.app.viewSwitcher.add(this.view);
        this.view.skeleton();
        this.styleGroup.skeletonTo($(".button-style-section", this.view.element));
        this.sizeGroup.skeletonTo($(".button-size-section", this.view.element));
        return UIButtonView.__super__.oncreate.apply(this, arguments);
      };

      UIButtonView.prototype.onstart = function() {
        this.app.navbar.show(this.nav);
        this.app.viewSwitcher.show(this.view);
        this.nav.render();
        this.view.render();
        this.styleGroup.render();
        this.sizeGroup.render();
        return UIButtonView.__super__.onstart.apply(this, arguments);
      };

      UIButtonView.prototype.ondestroy = function() {
        this.styleSection.destroy();
        this.sizeGroup.destroy();
        this.nav.destroy();
        this.view.destroy();
        return UIButtonView.__super__.ondestroy.apply(this, arguments);
      };

      return UIButtonView;

    })(View);
    return {
      UIButtonView: UIButtonView
    };
  });

}).call(this);
