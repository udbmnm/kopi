(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/utils/structs/queue", function(require, exports, module) {
    var EventQueue, Queue, array, events, klass;
    array = require("kopi/utils/array");
    events = require("kopi/events");
    klass = require("kopi/utils/klass");
    /*
      Class for simple FIFO Queue data structure.
    */

    Queue = (function() {
      /*
          @constructor
      */

      function Queue() {
        this._queue = [];
      }

      Queue.prototype.enqueue = function(obj) {
        this._queue.push(obj);
        return this;
      };

      Queue.prototype.dequeue = function() {
        this._queue.shift();
        return this;
      };

      Queue.prototype.isEmpty = function() {
        return array.isEmpty(this._queue);
      };

      Queue.prototype.length = function() {
        return this._queue.length;
      };

      Queue.prototype.forEach = function(fn) {
        return array.forEach(this._queue, fn, this);
      };

      return Queue;

    })();
    /*
      Class for FIFO Queue data structure with events.
    */

    EventQueue = (function(_super) {
      var kls;

      __extends(EventQueue, _super);

      kls = EventQueue;

      kls.ENQUEUE_EVENT = "enqueue";

      kls.DEQUEUE_EVENT = "dequeue";

      klass.configure(EventQueue, {
        length: 0,
        unique: false
      });

      function EventQueue() {
        this._queue = [];
        this.configure();
      }

      EventQueue.prototype.enqueue = function(obj) {
        var cls, options, self;
        self = this;
        cls = this.constructor;
        options = self._options;
        if (options.unique) {
          array.remove(self._queue, obj);
        }
        self._queue.push(node);
        if (options.length > 0 && self._queue.length > options.length) {
          self._queue.shift();
        }
        self.emit(cls.ENQUEUE_EVENT, [obj]);
        return self;
      };

      EventQueue.prototype.dequeue = function() {
        var cls, obj, self;
        self = this;
        cls = this.constructor;
        obj = self._queue.shift();
        self.emit(cls.DEQUEUE_EVENT, [obj]);
        return obj;
      };

      EventQueue.prototype.isEmpty = function() {
        return array.isEmpty(this._queue);
      };

      EventQueue.prototype.length = function() {
        return this._queue.length;
      };

      EventQueue.prototype.forEach = function(fn) {
        return array.forEach(this._queue, fn, this);
      };

      return EventQueue;

    })(events.EventEmitter);
    return {
      Queue: Queue,
      EventQueue: EventQueue
    };
  });

}).call(this);
