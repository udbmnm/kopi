(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/widgets", function(require, exports, module) {
    var $, ON, Widget, events, exceptions, jquery, klass, map, object, settings, text, utils;
    $ = require("jquery");
    utils = require("kopi/utils");
    jquery = require("kopi/utils/jquery");
    klass = require("kopi/utils/klass");
    object = require("kopi/utils/object");
    text = require("kopi/utils/text");
    events = require("kopi/events");
    exceptions = require("kopi/exceptions");
    settings = require("kopi/settings");
    map = require("kopi/utils/structs/map");
    ON = "on";
    /*
      Base class of all UI components
    
      Life-cycle of a widget
    
           +--------+
           | Create |
           +---++---+
               ||
               ||
               \/
          +----++----+
          | Skeleton |
          +----++----+
               ||
               ||
               \/
           +---++---+
           | Render |
           +---++---+
               ||         +--------+
               |+-------->+  Lock  |
               ||         +---++---+
               ||             ||
               ||             \/
               ||         +---++---+
               |+<--------+ Unlock |
               ||         +--------+
               ||
               ||         +--------+
               |+<------->+ Update |
               ||         +--------+
               \/
           +---++----+
           | Destroy |
           +---++----+
    
      1. Create
    
      2. Skeleton
    
      3. Render
    
      4. Destroy
    
      5. Lock
    
      6. Unlock
    
      7. Update
    */

    Widget = (function(_super) {
      var defineMethod, kls, method, proto, _i, _len, _ref;

      __extends(Widget, _super);

      kls = Widget;

      klass.configure(kls, {
        tagName: "div",
        extraClass: "",
        template: void 0,
        context: void 0
      });

      kls.SKELETON_EVENT = "skeleton";

      kls.RENDER_EVENT = "render";

      kls.UPDATE_EVENT = "update";

      kls.DESTROY_EVENT = "destroy";

      kls.LOCK_EVENT = "lock";

      kls.UNLOCK_EVENT = "unlock";

      kls.RESIZE_EVENT = "resize";

      klass.accessor(kls, "widgetName", {
        get: function() {
          return this._widgetName || (this._widgetName = this.name);
        }
      });

      proto = kls.prototype;

      klass.accessor(proto, "end");

      /*
          A helper method to generate CSS class names added to widget element
      */


      kls.cssClass = function(action, prefix) {
        var key, value;
        if (prefix == null) {
          prefix = "";
        }
        this._cssClasses || (this._cssClasses = {});
        key = "" + action + "," + prefix;
        value = this._cssClasses[key];
        if (!value) {
          this.prefix || (this.prefix = text.dasherize(this.widgetName(), '-'));
          value = this.prefix;
          if (prefix) {
            value = prefix + "-" + value;
          }
          value = (this._options.prefix || settings.kopi.ui.prefix) + "-" + value;
          if (action) {
            value = value + "-" + action;
          }
          this._cssClasses[key] = value;
        }
        return value;
      };

      kls.eventName = function(name) {
        var value;
        this._eventNames || (this._eventNames = {});
        value = this._eventNames[name];
        if (!value) {
          this.namespace || (this.namespace = "." + this.widgetName().toLowerCase());
          value = name + this.namespace;
          this._eventNames[name] = value;
        }
        return value;
      };

      /*
          A helper method to generate CSS class names regexps for states
      */


      kls.stateRegExp = function(prefix) {
        var regExp;
        if (prefix == null) {
          prefix = "";
        }
        this._stateRegExps || (this._stateRegExps = {});
        if (prefix in this._stateRegExps) {
          return this._stateRegExps[prefix];
        }
        regExp = new RegExp(this.cssClass("[^\s]+\s*", prefix), 'g');
        return this._stateRegExps[prefix] = regExp;
      };

      function Widget(options) {
        var self, _base;
        if (options == null) {
          options = {};
        }
        self = this;
        (_base = self.constructor).prefix || (_base.prefix = text.dasherize(self.constructor.widgetName()));
        self.guid = utils.guid(self.constructor.prefix);
        self._end = null;
        self.initialized = false;
        self.rendered = false;
        self.locked = false;
        self.active = true;
        self.configure(options);
      }

      /*
          Ensure basic skeleton of widget usually with a loader
      */


      Widget.prototype.skeleton = function(element) {
        var cls, cssClass, self;
        cls = this.constructor;
        self = this;
        if (self.initialized || self.locked) {
          return self;
        }
        self.element || (self.element = self._ensureElement(element));
        self.element.attr('id', self.guid);
        cssClass = cls.cssClass();
        if (!self.element.hasClass(cssClass)) {
          self.element.addClass(cssClass);
        }
        self._readOptions();
        if (self._options.extraClass) {
          self.element.addClass(self._options.extraClass);
        }
        self.emit(cls.SKELETON_EVENT);
        if (self._widgets) {
          self._widgets.forEach(function(name, widget) {
            if (widget.options().autoSkeleton !== false) {
              return widget.skeletonTo(self.element);
            }
          });
        }
        self.initialized = true;
        return self;
      };

      Widget.prototype.skeletonTo = function(element) {
        var cls;
        cls = this.constructor;
        return this.skeleton().appendTo(element);
      };

      /*
          Render widget when data is ready
      */


      Widget.prototype.render = function() {
        var cls, self;
        self = this;
        if (self.rendered || self.locked) {
          return self;
        }
        cls = this.constructor;
        self.emit(cls.RENDER_EVENT);
        self.emit(cls.RESIZE_EVENT);
        if (self._widgets) {
          self._widgets.forEach(function(name, widget) {
            if (widget.options().autoRender !== false) {
              return widget.render();
            }
          });
        }
        self.rendered = true;
        return self;
      };

      Widget.prototype.update = function() {
        var cls, self;
        self = this;
        if (self.locked) {
          return self;
        }
        cls = this.constructor;
        return self.emit(cls.UPDATE_EVENT);
      };

      /*
          Unregister event listeners, remove elements and so on
      */


      Widget.prototype.destroy = function() {
        var cls, self;
        self = this;
        if (self.locked) {
          return self;
        }
        cls = this.constructor;
        self.element.remove();
        self.off();
        self.emit(cls.DESTROY_EVENT);
        if (self._widgets) {
          self._widgets.forEach(function(name, widget) {
            if (widget.options().autoDestroy !== false) {
              return widget.destroy();
            }
          });
        }
        self.initialized = false;
        self.rendered = false;
        return self;
      };

      /*
          Disable events
      */


      Widget.prototype.lock = function() {
        var cls, self;
        self = this;
        if (self.locked) {
          return self;
        }
        cls = this.constructor;
        self.element.addClass(self.constructor.cssClass("lock"));
        self.emit(cls.LOCK_EVENT);
        self.locked = true;
        return self;
      };

      /*
          Enable events
      */


      Widget.prototype.unlock = function() {
        var cls, self;
        self = this;
        if (!self.locked) {
          return self;
        }
        cls = this.constructor;
        self.element.removeClass(self.constructor.cssClass("lock"));
        self.emit(cls.UNLOCK_EVENT);
        self.locked = false;
        return self;
      };

      Widget.prototype.onskeleton = function() {};

      Widget.prototype.onrender = function() {};

      Widget.prototype.onupdate = function() {};

      Widget.prototype.ondestroy = function() {};

      Widget.prototype.onresize = function() {};

      Widget.prototype.onlock = function() {};

      Widget.prototype.onunlock = function() {};

      defineMethod = function(proto, method) {
        return proto[method] = function() {
          var _ref;
          (_ref = this.element)[method].apply(_ref, arguments);
          return this;
        };
      };

      _ref = ["appendTo", "prependTo"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        method = _ref[_i];
        defineMethod(proto, method);
      }

      /*
          Check if widgets are same
      */


      Widget.prototype.equals = function(widget) {
        return this.guid === widget.guid;
      };

      /*
          Human readable widget name
      */


      Widget.prototype.widget = function() {
        return this.element;
      };

      Widget.prototype.toString = function() {
        return "[" + (this.constructor.widgetName()) + " " + this.guid + "]";
      };

      /*
          Add or update state class and data attribute to element
      */


      Widget.prototype.state = function(name, value) {
        var cls;
        if (value === null) {
          return this.element.attr("data-" + name);
        } else {
          cls = this.constructor;
          return this.element.attr("data-" + name, value).replaceClass(cls.stateRegExp(name), "").addClass(cls.cssClass(value, name));
        }
      };

      /*
          Remove state class and data attribute from element
      */


      Widget.prototype.removeState = function(name) {
        return this.element.removeAttr("data-" + name).replaceClass(this.constructor.stateRegExp(name), "");
      };

      /*
          Create a child widget which is initialized, rendered and destroyed
          when parent widget is doing so
      */


      Widget.prototype.register = function(name, widgetClass, options) {
        var self, widget, widgetOptions;
        self = this;
        self._widgets || (self._widgets = new map.Map());
        widgetOptions = self._extractOptions(name);
        if (options) {
          object.extend(widgetOptions, options);
        }
        widget = new widgetClass(widgetOptions).end(self);
        self["_" + name] = widget;
        klass.accessor(self, name);
        self._widgets.set(name, widget);
        return self;
      };

      /*
          Remove a child widget with the given name
      */


      Widget.prototype.unregister = function(name) {
        var self, widget;
        self = this;
        if (!self._widgets) {
          return;
        }
        widget = self._widgets.get(name);
        if (name && widget) {
          self._widgets.remove(name);
          delete self[name];
          delete self["_" + name];
          widget.destroy();
        }
        return self;
      };

      /*
          Get or create element
      */


      Widget.prototype._ensureElement = function(element) {
        var self;
        self = this;
        if (element) {
          return $(element);
        }
        if (self._options.element) {
          element = $(self._options.element);
          if (element.length) {
            return element;
          }
        }
        element = $(document.createElement(self._options.tagName));
        if (self._options.template) {
          element.html(self._options.template.render(self._options.context));
        }
        return element;
      };

      /*
          Get or create wrapper element
      */


      Widget.prototype._ensureWrapper = function(name, tag, parent) {
        var cls, cssClass, self, wrapper;
        if (name == null) {
          name = "wrapper";
        }
        if (tag == null) {
          tag = "div";
        }
        cls = this.constructor;
        self = this;
        parent || (parent = self.element);
        cssClass = cls.cssClass(name);
        wrapper = $("." + cssClass, parent);
        if (!wrapper.length) {
          wrapper = $("<" + tag + "></" + tag + ">", {
            "class": cssClass
          }).appendTo(parent);
        }
        return wrapper;
      };

      /*
          Update options from data attributes of element
      */


      Widget.prototype._readOptions = function() {
        var name, value, _ref1;
        if (!(this.element.length > 0)) {
          return this;
        }
        _ref1 = this._options;
        for (name in _ref1) {
          value = _ref1[name];
          value = this.element.data(text.dasherize(name));
          if (value !== void 0) {
            this._options[name] = value;
          }
        }
        return this;
      };

      /*
          DEPRECATED execute callback function defined in options
      */


      Widget.prototype._callback = function(event, args) {
        var fn;
        fn = this._options[ON + event];
        if (fn) {
          fn.apply(this, args);
        }
        return this;
      };

      /*
          Extract options with specfic prefix
      */


      Widget.prototype._extractOptions = function(prefix) {
        var name, options, self, value, _ref1;
        if (!prefix) {
          return self._options;
        }
        self = this;
        options = {};
        _ref1 = self._options;
        for (name in _ref1) {
          value = _ref1[name];
          if (text.startsWith(name, prefix)) {
            name = text.lowercase(name.replace(prefix, ""));
            options[name] = value;
          }
        }
        return options;
      };

      return Widget;

    })(events.EventEmitter);
    return {
      Widget: Widget
    };
  });

}).call(this);
