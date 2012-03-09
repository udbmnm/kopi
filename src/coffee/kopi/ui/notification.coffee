define "kopi/ui/notification", (require, exports, module) ->

  i18n = require "kopi/utils/i18n"
  exceptions = require "kopi/exceptions"
  bubbles = require "kopi/ui/notification/bubbles"
  dialogs = require "kopi/ui/notification/dialogs"
  indicators = require "kopi/ui/notification/indicators"
  overlays = require "kopi/ui/notification/overlays"

  ###
  Error raised when dialog or other components are double activated
  ###
  class DuplicateNotificationError extends exceptions.Exception

  # Get singleton instances of notification widgets
  overlay: -> overlays.instance()
  dialog: -> dialogs.instance()
  indicator: -> indicators.instance()
  bubble: -> bubbles.instance()
  # Shortcut methods for notification widgets
  lock: (transparent=false) -> overlay().show(transparent)
  unlock: -> overlay().hide()
  loading: (transparent=false) -> indicator().show(transparent)
  loaded: -> indicator().hide()
  message: (text) -> bubble().content(text).show()
