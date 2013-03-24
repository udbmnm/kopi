(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/notification/dialogs", function(require, exports, module) {
    var $, Button, Dialog, EllipsisText, array, dialogInstance, exceptions, hide, i18n, instance, klass, overlays, show, text, widgets;
    $ = require("jquery");
    exceptions = require("kopi/exceptions");
    array = require("kopi/utils/array");
    klass = require("kopi/utils/klass");
    text = require("kopi/utils/text");
    i18n = require("kopi/utils/i18n");
    require("kopi/ui/notification/messages/en");
    require("kopi/ui/notification/messages/zh_CN");
    widgets = require("kopi/ui/notification/widgets");
    overlays = require("kopi/ui/notification/overlays");
    EllipsisText = require("kopi/ui/text").EllipsisText;
    Button = require("kopi/ui/buttons").Button;
    /*
      dialog
        .title("xxx")
        .content("xxx")
        .action("xxx", (event, dialog) ->)
        .close("xxx", (event, dialog) ->)
        .show()
    */

    Dialog = (function(_super) {
      var kls, proto;

      __extends(Dialog, _super);

      kls = Dialog;

      kls.configure({
        title: i18n.t("kopi.notification.messages.title"),
        action: i18n.t("kopi.notification.messages.action"),
        close: i18n.t("kopi.notification.messages.close")
      });

      kls.ACTION_EVENT = "action";

      kls.CLOSE_EVENT = "close";

      proto = kls.prototype;

      klass.accessor(proto, "title", {
        get: function() {
          return this._title.text();
        },
        set: function(text) {
          return this._title.text(text);
        }
      });

      klass.accessor(proto, "content", {
        get: function() {
          return this._text.text();
        },
        set: function(text) {
          return this._text.text(text);
        }
      });

      function Dialog() {
        var cls, self;
        Dialog.__super__.constructor.call(this);
        cls = this.constructor;
        self = this;
        self._overlay = overlays.instance();
        self._title = new EllipsisText({
          extraClass: cls.cssClass("title"),
          tagName: 'h3',
          lineHeight: 50,
          lines: 1,
          autoSkeleton: false
        });
        self._text = new EllipsisText({
          extraClass: cls.cssClass("text"),
          valign: EllipsisText.VALIGN_MIDDLE,
          lines: 3,
          autoSkeleton: false
        });
        self._action = new Button({
          hasIcon: false,
          extraClass: cls.cssClass("action"),
          style: "primary",
          autoSkeleton: false,
          autoRender: false
        });
        self._close = new Button({
          hasIcon: false,
          extraClass: cls.cssClass("close"),
          style: "inverse",
          autoSkeleton: false,
          autoRender: false
        });
      }

      Dialog.prototype.onskeleton = function() {
        var cls, name, self, _i, _len, _ref;
        cls = this.constructor;
        self = this;
        _ref = ["gloss", "header", "content", "footer"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          self["_" + name] = self._ensureWrapper(name);
        }
        self._title.skeletonTo(self._header);
        self._text.skeletonTo(self._content);
        self._action.skeletonTo(self._footer);
        self._close.skeletonTo(self._footer);
        delete self._gloss;
        delete self._header;
        delete self._content;
        delete self._footer;
        self.reset();
        return Dialog.__super__.onskeleton.apply(this, arguments);
      };

      Dialog.prototype.onrender = function() {
        var cls, self;
        self = this;
        cls = this.constructor;
        self._title.render();
        self._text.render();
        self._action.render().on(Button.CLICK_EVENT, function() {
          return self.emit(cls.ACTION_EVENT);
        });
        self._close.render().on(Button.CLICK_EVENT, function() {
          return self.emit(cls.CLOSE_EVENT);
        });
        return Dialog.__super__.onrender.apply(this, arguments);
      };

      Dialog.prototype.ondestroy = function() {
        var self;
        self = this;
        self._title.destroy();
        self._text.destroy();
        self._action.destroy();
        self._close.destroy();
        return Dialog.__super__.ondestroy.apply(this, arguments);
      };

      /*
          Default behaviour when action button is clicked
      */


      Dialog.prototype.onaction = function() {
        return this.hide();
      };

      /*
          Default behaviour when close button is clicked
      */


      Dialog.prototype.onclose = function() {
        return this.hide();
      };

      Dialog.prototype.message = function(message) {
        var method, runFn, self, _i, _len, _ref;
        self = this;
        if (typeof message === "string") {
          self.content(message);
        } else if (message) {
          runFn = function(method) {
            if (method in message) {
              return self[method](message[method]);
            }
          };
          _ref = ["title", "content", "action", "close"];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            method = _ref[_i];
            runFn(method);
          }
        }
        return self;
      };

      Dialog.prototype.action = function(text, fn) {
        var cls;
        cls = this.constructor;
        if (text) {
          this._action.title(text);
        }
        if (fn) {
          this.off(cls.ACTION_EVENT).on(cls.ACTION_EVENT, fn);
        }
        return this;
      };

      Dialog.prototype.close = function(text, fn) {
        var cls;
        cls = this.constructor;
        if (text) {
          this._close.title(text);
        }
        if (fn) {
          this.off(cls.CLOSE_EVENT).on(cls.CLOSE_EVENT, fn);
        }
        return this;
      };

      /*
          Show dialog
      
          @param {Hash} options options for bubble
      
          @option {Boolean} lock if overlay is shown
          @option {Boolean} transparent if overlay is transparent
      */


      Dialog.prototype.show = function(options) {
        var cls, self;
        if (options == null) {
          options = {};
        }
        if (!this._text.text().length) {
          throw new exceptions.ValueError("Missing content of dialog");
        }
        cls = this.constructor;
        self = this;
        if (!self.hidden) {
          self.hide();
        }
        self.hidden = false;
        if (options.lock) {
          self._overlay.show(options.transparent);
        }
        self.element.addClass(cls.showClass());
        return self;
      };

      Dialog.prototype.hide = function() {
        var cls, self;
        cls = this.constructor;
        self = this;
        if (self.hidden) {
          return self;
        }
        self._overlay.hide();
        self.element.removeClass(cls.showClass());
        self.reset();
        return self;
      };

      Dialog.prototype.reset = function() {
        var cls, self;
        cls = this.constructor;
        self = this;
        this.hidden = true;
        return this.title(this._options.title).content("").action(this._options.action).close(this._options.close).off(cls.ACTION_EVENT).off(cls.CLOSE_EVENT);
      };

      return Dialog;

    })(widgets.Widget);
    dialogInstance = null;
    instance = function() {
      return dialogInstance || (dialogInstance = new Dialog().skeletonTo(document.body).render());
    };
    show = function() {
      var _ref;
      return (_ref = instance()).show.apply(_ref, arguments);
    };
    hide = function() {
      return instance.hide();
    };
    return {
      instance: instance,
      show: show,
      hide: hide,
      Dialog: Dialog
    };
  });

}).call(this);
