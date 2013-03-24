(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/db/adapters/kv", function(require, exports, module) {
    var KeyValueAdapter, client, object, text;
    text = require("kopi/utils/text");
    object = require("kopi/utils/object");
    client = require("kopi/db/adapters/client");
    /*
      Adapter for Key/Value Databases like local storage, memcached, redis, etc.
    
      Model definition
    
        class app.user.User extends Model
          cls = this
          cls.fields
            sid:
              type: Model.INTEGER
              primary: true
            login:
              type: Model.STRING
              index: true
            avatar:
              type: Model.STRING
    
      Data Structure
    
        == key ==                   == value ==
        kopi:user:1                 {"sid":1,"login":"kobe","avatar":null}
        kopi:user:2                 {"sid":2,"login":"kd35","avatar":"/avatars/kd35.jpg"}
        kopi:user:index:login       {"kopi":1,"kd35":2}
    
      TODO
        Support non-pk fields querying
        support multiple fields querying
        support non-unique index
    */

    KeyValueAdapter = (function(_super) {

      __extends(KeyValueAdapter, _super);

      function KeyValueAdapter() {
        return KeyValueAdapter.__super__.constructor.apply(this, arguments);
      }

      KeyValueAdapter.configure({
        keyPrefix: "kopi",
        keyDelimiter: ":"
      });

      KeyValueAdapter.prototype.create = function(query, fn) {
        var attrs, isKeyExists, key, model, pk, self;
        self = this;
        model = query.model;
        attrs = query.attrs();
        pk = query.pk();
        if (!pk) {
          if (fn) {
            fn("Must provide primary key");
          }
          return self;
        }
        key = self._keyForModel(model, pk);
        isKeyExists = !!self._get(key);
        if (isKeyExists) {
          if (fn) {
            fn("Primary key already exists.");
          }
          return self;
        }
        self._set(key, self._adapterObject(attrs, model.meta().names));
        if (fn) {
          fn(null);
        }
        return self;
      };

      KeyValueAdapter.prototype.retrieve = function(query, fn) {
        var error, key, model, pk, result, self, value;
        self = this;
        model = query.model;
        pk = query.pk();
        if (!pk) {
          if (fn) {
            fn("Must provide primary key");
          }
          return self;
        }
        key = self._keyForModel(model, pk);
        value = self._get(key);
        if (value) {
          try {
            result = [self._modelObject(value, model.meta().names)];
          } catch (e) {
            error = "Failed to parse value: " + e;
          }
          if (fn) {
            fn(error, result);
          }
        } else {
          if (fn) {
            fn(null, []);
          }
        }
        return self;
      };

      KeyValueAdapter.prototype.update = function(query, fn) {
        var retrieveFn, self;
        self = this;
        retrieveFn = function(error, result) {
          var key, model, value;
          if (error) {
            if (fn) {
              fn(error);
            }
            return;
          }
          model = query.model;
          key = self._keyForModel(model, query.pk());
          value = result[0];
          if (value) {
            object.extend(value, query.attrs());
            self._set(key, self._adapterObject(value, model.meta().names));
            if (fn) {
              return fn(null);
            }
          } else {
            if (fn) {
              return fn("Entry not found");
            }
          }
        };
        self.retrieve(query, retrieveFn);
        return self;
      };

      KeyValueAdapter.prototype.destroy = function(query, fn) {
        var key, model, pk, self;
        self = this;
        model = query.model;
        pk = query.pk();
        if (!pk) {
          if (fn) {
            fn("pk not found");
          }
          return self;
        }
        key = self._keyForModel(model, pk);
        if (fn) {
          fn(null, self._remove(key));
        }
        return self;
      };

      /*
          Build key for model instance
      */


      KeyValueAdapter.prototype._keyForModel = function(model, pk) {
        var delimiter, prefix, self;
        self = this;
        if (!self._keyForModelTmpl) {
          prefix = self._options.keyPrefix;
          delimiter = self._options.keyDelimiter;
          self._keyForModelTmpl = "" + prefix + delimiter + "{model}" + delimiter + "{pk}";
        }
        return text.format(self._keyForModelTmpl, {
          model: text.dasherize(model.name),
          pk: pk
        });
      };

      /*
          Build key for model index
      */


      KeyValueAdapter.prototype._keyForIndex = function(model, index) {
        var delimiter, prefix, self;
        if (index == null) {
          index = "pk";
        }
        self = this;
        if (!self._keyForIndexTmpl) {
          prefix = self._options.keyPrefix;
          delimiter = self._options.delimiter;
          self._keyForIndexTmpl = "" + prefix + delimiter + "{model}" + delimiter + "index" + delimiter + "{index}";
        }
        return text.format(self._keyForModelTmpl, {
          model: model,
          index: index
        });
      };

      /*
          Get value from db. Implement in subclasses
      */


      KeyValueAdapter.prototype._get = function(key, defaultValue, fn) {
        throw new exceptions.NotImplementedError();
      };

      /*
          Set value to db. Implement in subclasses
      */


      KeyValueAdapter.prototype._set = function(key, value, fn) {
        throw new exceptions.NotImplementedError();
      };

      /*
          Remove value from db. Implement in subclasses
      */


      KeyValueAdapter.prototype._remove = function(key, fn) {
        throw new exceptions.NotImplementedError();
      };

      return KeyValueAdapter;

    })(client.ClientAdapter);
    return {
      KeyValueAdapter: KeyValueAdapter
    };
  });

}).call(this);
