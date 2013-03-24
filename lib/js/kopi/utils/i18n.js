(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/utils/i18n", function(require, exports, module) {
    var $, TranslationError, define, exceptions, locales, messages, set, settings, text, translate, utils;
    $ = require("jquery");
    exceptions = require("kopi/exceptions");
    settings = require("kopi/settings");
    utils = require("kopi/utils");
    text = require("kopi/utils/text");
    set = require("kopi/utils/structs/set");
    locales = new set.Set(["en", "zh_CN"]);
    messages = {};
    /*
      Error raised when transition can not be found
    */

    TranslationError = (function(_super) {

      __extends(TranslationError, _super);

      function TranslationError(name) {
        TranslationError.__super__.constructor.call(this, "Missing translation \"" + name + "\", [" + settings.kopi.i18n.locale + ", " + settings.kopi.i18n.fallback + "]");
      }

      return TranslationError;

    })(exceptions.Exception);
    /*
      Lookup text translation
    
      @param  {String}  name
      @param  {Hash}    params
    */

    translate = function(name, params) {
      try {
        return text.format(text.constantize(name, messages[settings.kopi.i18n.locale]), params);
      } catch (e) {
        try {
          return text.format(text.constantize(name, messages[settings.kopi.i18n.fallback]), params);
        } catch (e) {
          if (params && params.missing) {
            return params.missing;
          }
          throw new TranslationError(name);
        }
      }
    };
    /*
      Define text translation
    
      @param  {String}  locale
      @param  {Hash}    translation
    */

    define = function(locale, translation) {
      var target;
      locales.add(locale);
      target = messages[locale] || (messages[locale] = {});
      $.extend(true, target, translation);
    };
    return {
      TranslationError: TranslationError,
      translate: translate,
      t: translate,
      define: define,
      d: define
    };
  });

}).call(this);
