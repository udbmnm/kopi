kopi.module("kopi.jsonrpc")
  .require("kopi.exceptions")
  .request("kopi.utils")
  .define (exports, exceptions, utils) ->

    ###
    A lightweight JSON-RPC message wrapper
    ###
    MESSAGE_PREFIX = "kopi-message"
    JSON_RPC_VERSION = "2.0"

    ###
    Build a request
    ###
    request = (id, method, params={}) ->
      if not method
        throw new exceptions.ValueError("`method` is required.")

      id: id
      method: method
      params: params
      jsonrpc: JSON_RPC_VERSION

    ###
    Build a notification
    ###
    notification = (method, params={}) ->
      request(null, method, params)

    ###
    Build a response
    ###
    response = (id, error, result) ->
      unless error? or result?
        throw new exceptions.ValueError("Either `error` or `result` is required.")

      id: id
      error: error
      result: result
      jsonrpc: JSON_RPC_VERSION

    ###
    Build a success response
    ###
    success = (id, result) -> response(id, null, result)

    ###
    Build a error response
    ###
    error = (id, error) -> response(id, error)

    exports.request = request
    exports.notification = notification

    exports.response = response
    exports.success = success
    exports.error = error
