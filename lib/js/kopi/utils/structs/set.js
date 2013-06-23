(function() {

  define("kopi/utils/structs/set", function(require, exports, module) {
    var Set, map;
    map = require("kopi/utils/structs/map");
    Set = (function() {

      function Set(set) {
        var item, _i, _len;
        this._map = new map.Map();
        if (set) {
          for (_i = 0, _len = set.length; _i < _len; _i++) {
            item = set[_i];
            this.add(item);
          }
        }
      }

      Set.prototype.has = function(key) {
        return this._map.has(key);
      };

      Set.prototype.add = function(key) {
        return this._map.set(key, true);
      };

      Set.prototype.remove = function(key) {
        return this._map.remove(key);
      };

      Set.prototype.forEach = function(iterator) {
        var self;
        self = this;
        if (iterator) {
          self._map.forEach(function(key) {
            return iterator.call(self, key);
          });
        }
        return self;
      };

      Set.prototype.length = function() {
        return this._map.length();
      };

      return Set;

    })();
    return {
      Set: Set
    };
  });

}).call(this);
