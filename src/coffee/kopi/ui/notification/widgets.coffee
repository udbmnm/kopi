kopi.module("kopi.ui.notification.widgets")
  .require("kopi.settings")
  .require("kopi.utils.text")
  .require("kopi.ui.widgets")
  .define (exports, settings, text, widgets) ->

    class Widget extends widgets.Widget

      actions = ["show", "hide", "transparent"]

      for action in actions
        ((a) => this["#{a}Class"] = ->)(action)

      # 是否在前台显示
      active: true

      constructor: (element, options) ->
        unless element
          this.constructor.prefix or= text.underscore(this.constructor.name)
          element = settings.kopi.ui.notification[this.constructor.prefix]
        super(element, options)

    exports.Widget = Widget