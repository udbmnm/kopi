define "kopi/ui/lists/items", (require, exports, module) ->

  buttons = require "kopi/ui/buttons"
  widgets = require "kopi/ui/widgets"
  lists = require "kopi/ui/lists"
  app = require "kopi/app"

  ###
  Base class of list items
  ###
  class BaseListItem extends widgets.Widget

    constructor: (list, options) ->
      super(options)
      this.list = list

  ###
  A simple list item filled with button
  ###
  class ListItem extends BaseListItem

    this.widgetName "ListItem"

    constructor: (list, text) ->
      super(list)
      this.register "button", buttons.Button,
        size: false
        style: false
        rounded: false
        hasIcon: false
      this._button.title(text)

  class NavListItem extends ListItem

    this.widgetName "NavListItem"

    constructor: (list, data) ->
      super(list, data[0])
      self = this
      self._url = data[1]
      self._button.on buttons.Button.CLICK_EVENT, ->
        app.instance().load(self._url)

  BaseListItem: BaseListItem
  ListItem: ListItem
  NavListItem: NavListItem
