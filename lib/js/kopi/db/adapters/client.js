(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/db/adapters/client", function(require, exports, module) {
    var ClientAdapter, base;
    base = require("kopi/db/adapters/base");
    /*
      Base class for client side adapters
    */

    ClientAdapter = (function(_super) {

      __extends(ClientAdapter, _super);

      function ClientAdapter() {
        return ClientAdapter.__super__.constructor.apply(this, arguments);
      }

      return ClientAdapter;

    })(base.BaseAdapter);
    return {
      ClientAdapter: ClientAdapter
    };
  });

}).call(this);
