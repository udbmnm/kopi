(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/utils/http", function(require, exports, module) {
    var $, ActivePool, EventEmitter, Map, Request, RequestPool, RequestQueue, klass, logger, logging, queue, request, utils, _ref, _ref1;

    $ = require("jquery");
    EventEmitter = require("kopi/events").EventEmitter;
    utils = require("kopi/utils");
    klass = require("kopi/utils/klass");
    Map = require("kopi/utils/structs/map").Map;
    logging = require("kopi/logging");
    logger = logging.logger(module.id);
    /*
    `Request` is a wrapper for jQuery.ajax method to work with `RequestQueue`
    */

    Request = (function() {
      Request.prefix = "request";

      Request.STATE_PENDING = 0;

      Request.STATE_PROCESSING = 1;

      Request.STATE_SUCCESS = 2;

      Request.STATE_ERROR = 3;

      function Request(options) {
        var cls;

        this.options = options;
        cls = this.constructor;
        this.guid = this.options.guid || utils.guid(cls.prefix);
        this.state = cls.STATE_PENDING;
        this._request = null;
        this._timer = null;
      }

      Request.prototype.perform = function(fn) {
        var ajaxFn, cls, originalErrorFn, originalSuccessFn,
          _this = this;

        cls = this.constructor;
        this.state = cls.STATE_PROCESSING;
        originalSuccessFn = this.options.success;
        this.options.success = function(data, text, xhr) {
          _this.state = cls.STATE_SUCCESS;
          if (originalSuccessFn) {
            originalSuccessFn.apply(null, arguments);
          }
          if (fn) {
            return fn(null, data, text);
          }
        };
        originalErrorFn = this.options.error;
        this.options.error = function(xhr, text, error) {
          _this.state = cls.STATE_ERROR;
          if (originalErrorFn) {
            originalErrorFn.apply(null, arguments);
          }
          if (fn) {
            return fn(error, null, text);
          }
        };
        ajaxFn = function() {
          logger.log("[http:request] " + (_this.options.type || "GET") + " " + _this.options.url);
          _this._request = $.ajax(_this.options);
          return _this._timer = null;
        };
        if (this.options.delay) {
          return this.timer = setTimeout(ajaxFn, this.options.delay);
        } else {
          return ajaxFn();
        }
      };

      Request.prototype.abort = function() {
        var cls;

        cls = this.constructor;
        if (this.state === cls.STATE_PROCESSING) {
          return;
        }
        if (this._request) {
          this._request.abort();
          this._request = null;
        }
        if (this._timer) {
          clearTimeout(this._timer);
          this._timer = null;
        }
        this.state = cls.STATE_ERROR;
      };

      return Request;

    })();
    RequestPool = (function(_super) {
      __extends(RequestPool, _super);

      function RequestPool() {
        _ref = RequestPool.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      RequestPool.prototype.shift = function() {
        var key, value;

        if (this._keys.length === 0) {
          return;
        }
        key = this._keys.shift();
        value = this._values.shift();
        return value;
      };

      return RequestPool;

    })(Map);
    ActivePool = (function(_super) {
      __extends(ActivePool, _super);

      function ActivePool() {
        _ref1 = ActivePool.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      return ActivePool;

    })(RequestPool);
    /*
    Make AJAX requests run in a sequential manner
    
    TODO Retry when error happens
    */

    RequestQueue = (function(_super) {
      __extends(RequestQueue, _super);

      RequestQueue.ENQUEUE_EVENT = "enqueue";

      RequestQueue.ABORT_EVENT = "abort";

      RequestQueue.COMPLETE_EVENT = "complete";

      RequestQueue.SUCCESS_EVENT = "success";

      RequestQueue.ERROR_EVENT = "error";

      RequestQueue.EMPTY_EVENT = "empty";

      klass.configure(RequestQueue, {
        concurrency: 2
      });

      function RequestQueue(options) {
        this.configure(options);
        this._pending = new RequestPool();
        this._active = new ActivePool();
      }

      /*
      Add an request to queue
      */


      RequestQueue.prototype.enqueue = function(request) {
        if (!request) {
          return;
        }
        if (!(request instanceof Request)) {
          request = new Request(request);
        }
        this._pending.set(request.guid, request);
        this._checkActivePool();
        this.emit(this.constructor.ENQUEUE_EVENT, [request]);
        return request;
      };

      /*
      Remove request from queue
      */


      RequestQueue.prototype.abort = function(request) {
        if (request.state === Request.STATE_PROCESSING) {
          request.abort();
        }
        if (!this._active.remove(request.guid)) {
          this._pending.remove(request.guid);
        }
        this.emit(this.constructor.ABORT_EVENT, [request]);
        return request;
      };

      /*
      Remove all requests from queue
      */


      RequestQueue.prototype.abortAll = function() {
        var _this = this;

        this._pending.forEach(function(request) {
          _this.pending.remove(request.guid);
          return _this.emit(_this.constructor.ABORT_EVENT, [request]);
        });
        this._active.forEach(function(request) {
          if (request.state === Request.STATE_PROCESSING) {
            request.abort();
          }
          _this._active.remove(request.guid);
          return _this.emit(_this.constructor.ABORT_EVENT, [request]);
        });
      };

      /*
      To see if active pool is available for new request
      */


      RequestQueue.prototype._checkActivePool = function() {
        var len, request;

        len = this._active.length();
        if (len < this._options.concurrency) {
          request = this._pending.shift();
          if (request) {
            return this._perform(request);
          } else if (len === 0) {
            return this.emit(this.constructor.EMPTY_EVENT);
          }
        }
      };

      /*
      To send a request
      */


      RequestQueue.prototype._perform = function(request) {
        var cls,
          _this = this;

        cls = this.constructor;
        this._active.set(request.guid, request);
        return request.perform(function(error, data, text) {
          var args;

          args = [request].concat(arguments);
          _this.emit(cls.COMPLETE_EVENT, args);
          _this.emit((error ? cls.ERROR_EVENT : cls.SUCCESS_EVENT), args);
          _this._active.remove(request.guid);
          return _this._checkActivePool();
        });
      };

      return RequestQueue;

    })(EventEmitter);
    queue = new RequestQueue();
    /*
    Provide some high-level wrappers around $.ajax
    */

    request = function(options) {
      if (options.queue === true) {
        return queue.enqueue(options);
      } else if (options.queue instanceof RequestQueue) {
        return options.queue.enqueue(options);
      } else {
        logger.log("[http:request] " + (options.type || "GET") + " " + options.url);
        return $.ajax(options);
      }
    };
    return {
      queue: queue,
      request: request,
      Request: Request,
      RequestQueue: RequestQueue
    };
  });

}).call(this);
