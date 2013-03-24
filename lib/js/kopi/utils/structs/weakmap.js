(function() {

  define("kopi/utils/structs/weakmap", function(require, exports, module) {
    /*
      WeakMaps are key/value maps in which keys are objects.
    */

    var WeakMap;
    WeakMap = (function() {

      function WeakMap() {
        this._keys = [];
        this._values = [];
      }

      /*
          Returns the value associated to the key object, defaultValue if there is none.
      */


      WeakMap.prototype.get = function(key, defaultValue) {
        var i;
        i = this._keys.indexOf(key);
        if (i < 0) {
          return defaultValue;
        } else {
          return this._values[i];
        }
      };

      /*
          Set the value for the key object in WeakMap
      */


      WeakMap.prototype.set = function(key, value) {
        var i;
        i = this._keys.indexOf(key);
        if (i < 0) {
          i = this._keys.length;
        }
        this._keys[i] = key;
        this._values[i] = value;
        return this;
      };

      /*
          Returns a boolean asserting whether a value has been associated to the key object
          in WeakMap or not
      */


      WeakMap.prototype.has = function(key) {
        return this._keys.indexOf(key) >= 0;
      };

      /*
          Removes any value associated to the key object. After such a call, WeakMap.has(key)
          will return false.
      */


      WeakMap.prototype.remove = function(key) {
        var i;
        i = this._keys.indexOf(key);
        if (i >= 0) {
          this._keys.splice(i, 1);
          this._values.splice(i, 1);
          return true;
        } else {
          return false;
        }
      };

      /*
          Iterate over the map
      */


      WeakMap.prototype.forEach = function(iterator) {
        var i, key, value, _i, _len, _ref;
        if (iterator) {
          _ref = this._keys;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            key = _ref[i];
            value = this._values[i];
            iterator.call(this, key, value);
          }
        }
        return this;
      };

      WeakMap.prototype.length = function() {
        return this._keys.length;
      };

      return WeakMap;

    })();
    return {
      WeakMap: WeakMap
    };
  });

}).call(this);
