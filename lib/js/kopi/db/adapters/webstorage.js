(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/db/adapters/webstorage", function(require, exports, module) {
    var StorageAdapater, klass, kv, logger, logging, models, storage, support;
    logging = require("kopi/logging");
    klass = require("kopi/utils/support");
    support = require("kopi/utils/support");
    kv = require("kopi/db/adapters/kv");
    models = require("kopi/db/models");
    logger = logging.logger(module.id);
    storage = localStorage;
    StorageAdapater = (function(_super) {

      __extends(StorageAdapater, _super);

      function StorageAdapater() {
        return StorageAdapater.__super__.constructor.apply(this, arguments);
      }

      StorageAdapater.support = function() {
        return !!support.storage;
      };

      StorageAdapater.prototype._get = function(key, defautValue, fn) {
        var value;
        value = storage.getItem(key);
        value = value != null ? value : defautValue;
        if (fn) {
          fn(null, value);
        }
        return value;
      };

      StorageAdapater.prototype._set = function(key, value, fn) {
        try {
          storage.setItem(key, value);
          if (fn) {
            fn(null);
          }
        } catch (e) {
          if (e === QUOTA_EXCEEDED_ERR) {
            logger.error(e);
            if (fn) {
              fn(e);
            }
          } else {
            throw e;
          }
        }
        return value;
      };

      StorageAdapater.prototype._remove = function(key, fn) {
        var value;
        value = storage.removeItem(key);
        if (fn) {
          fn(null, value);
        }
        return value;
      };

      StorageAdapater.prototype._adapterValue = function(value, field) {
        var self;
        self = this;
        switch (field.type) {
          case models.DATETIME:
            return value.getTime();
          case models.JSON:
            return self._adapterObject(value);
          default:
            return StorageAdapater.__super__._adapterValue.apply(this, arguments);
        }
      };

      StorageAdapater.prototype._modelValue = function(value, field) {
        var self;
        self = this;
        switch (field.type) {
          case models.DATETIME:
            return new Date(value);
          case models.JSON:
            return self._modelObject(value);
          default:
            return StorageAdapater.__super__._modelValue.apply(this, arguments);
        }
      };

      /*
          Save as string in local storage
      */


      StorageAdapater.prototype._adapterObject = function(obj, fields) {
        return JSON.stringify(StorageAdapater.__super__._adapterObject.call(this, obj, fields));
      };

      StorageAdapater.prototype._modelObject = function(string, fields) {
        return StorageAdapater.__super__._modelObject.call(this, JSON.parse(string), fields);
      };

      return StorageAdapater;

    })(kv.KeyValueAdapter);
    return {
      StorageAdapater: StorageAdapater
    };
  });

}).call(this);
