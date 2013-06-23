(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/db/adapters/server", function(require, exports, module) {
    var $, ServerAdapter, base, logger, logging;
    $ = require("jquery");
    base = require("kopi/db/adapters/base");
    logging = require("kopi/logging");
    logger = logging.logger(module.id);
    ServerAdapter = (function(_super) {
      var action, kls, proto, requestFn, _i, _len, _ref;

      __extends(ServerAdapter, _super);

      function ServerAdapter() {
        return ServerAdapter.__super__.constructor.apply(this, arguments);
      }

      kls = ServerAdapter;

      kls.configure({
        createMethod: "POST",
        retrieveMethod: "GET",
        updateMethod: "PUT",
        destroyMethod: "DELETE",
        onlyParam: "only",
        whereParam: "where",
        sortParam: "sort",
        skipParam: "skip",
        limitParam: "limit",
        attrsParam: "attrs",
        countParam: "count",
        format: "JSON",
        timeout: 30000
      });

      requestFn = function() {
        return this._request.apply(this, arguments);
      };

      proto = kls.prototype;

      _ref = kls.ACTIONS;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        proto[action] = requestFn;
      }

      ServerAdapter.prototype.raw = function(query, fn) {
        requestFn = function(error, result) {
          var collection, entry, i, model, _j, _len1;
          if (error) {
            if (fn) {
              fn(error, result);
            }
            return;
          }
          collection = [];
          if (result.length > 0) {
            for (i = _j = 0, _len1 = result.length; _j < _len1; i = ++_j) {
              entry = result[i];
              model = new query.model(entry);
              model.isNew = false;
              collection.push(model);
            }
          }
          if (fn) {
            return fn(error, collection);
          }
        };
        return this._request(query, requestFn);
      };

      ServerAdapter.prototype._url = function(query, url) {
        var name, value, _ref1;
        url || (url = this._options["" + (query.action()) + "URL"]);
        if (url) {
          _ref1 = query.criteria().where;
          for (name in _ref1) {
            value = _ref1[name];
            if (value.eq) {
              url = url.replace(":" + name, value.eq);
            }
          }
        }
        return url;
      };

      ServerAdapter.prototype._method = function(query) {
        return this._options["" + (query.action()) + "Method"];
      };

      ServerAdapter.prototype._params = function(query) {
        return query.params();
      };

      ServerAdapter.prototype._request = function(query, fn) {
        var args, doneFn, failFn, method, options, params, self, url;
        self = this;
        options = self._options;
        if (self._isRawQuery(query)) {
          args = query.args()[0];
          url = args.url;
          method = args.method || options.retrieveMethod;
          params = args.params || {};
        } else {
          url = self._url(query);
          method = self._method(query);
          params = self._params(query);
        }
        doneFn = function(response) {
          args = self._parse(response);
          return fn(args[0], args[1]);
        };
        failFn = function(xhr, text, error) {
          error = self._parseError(xhr, text, error);
          return fn(error[0]);
        };
        logger.info("Request URL: " + url);
        return $.ajax({
          url: url,
          type: method,
          data: params,
          dataType: options.format,
          timeout: options.timeout,
          success: doneFn,
          error: failFn
        });
      };

      ServerAdapter.prototype._parse = function(response) {
        return this["_parse" + this._options.format](response);
      };

      ServerAdapter.prototype._parseError = function(response) {
        return this["_parseError" + this._options.format](response);
      };

      ServerAdapter.prototype._parseJSON = function(json) {
        if (json && json.ok) {
          return [null, json.result];
        } else {
          return [json.error || true];
        }
      };

      ServerAdapter.prototype._parseErrorJSON = function(xhr, text, error) {
        return [error || true];
      };

      ServerAdapter.prototype._isRawQuery = function(query) {
        return query.action() === "raw";
      };

      return ServerAdapter;

    })(base.BaseAdapter);
    return {
      ServerAdapter: ServerAdapter
    };
  });

}).call(this);
