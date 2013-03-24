(function() {

  define("kopi/jsonrpc", function(require, exports, module) {
    var JSON_RPC_VERSION, MESSAGE_PREFIX, error, exceptions, notification, request, response, success, utils;
    exceptions = require("kopi/exceptions");
    utils = require("kopi/utils");
    /*
      A lightweight JSON-RPC message wrapper
    */

    MESSAGE_PREFIX = "kopi-message";
    JSON_RPC_VERSION = "2.0";
    /*
      Build a request
    */

    request = function(id, method, params) {
      if (params == null) {
        params = {};
      }
      if (!method) {
        throw new exceptions.ValueError("`method` is required.");
      }
      return {
        id: id,
        method: method,
        params: params,
        jsonrpc: JSON_RPC_VERSION
      };
    };
    /*
      Build a notification
    */

    notification = function(method, params) {
      if (params == null) {
        params = {};
      }
      return request(null, method, params);
    };
    /*
      Build a response
    */

    response = function(id, error, result) {
      if (!((error != null) || (result != null))) {
        throw new exceptions.ValueError("Either `error` or `result` is required.");
      }
      return {
        id: id,
        error: error,
        result: result,
        jsonrpc: JSON_RPC_VERSION
      };
    };
    /*
      Build a success response
    */

    success = function(id, result) {
      return response(id, null, result);
    };
    /*
      Build a error response
    */

    error = function(id, error) {
      return response(id, error);
    };
    return {
      request: request,
      notification: notification,
      response: response,
      success: success,
      error: error
    };
  });

}).call(this);
