kopi.module("kopi.app.views")
  .require("kopi.exceptions")
  .require("kopi.settings")
  .require("kopi.events")
  .require("kopi.logging")
  .require("kopi.utils")
  .require("kopi.utils.html")
  .require("kopi.utils.text")
  .require("kopi.ui.contents")
  .define (exports, exceptions, settings, events, logging
                  , utils, html, text, contents) ->

    ###
    View 的基类

    视图的载入应该越快越好，所以 AJAX 和数据库等 IO 操作不应该阻塞视图的显示
    ###
    class View extends events.EventEmitter

      ###
      @type {Hash <String, Content>}
      ###
      this._contents = {}

      ###
      Extend contents
      ###
      this.contents = (contents={}) ->
        utils.extend this._contents, contents

      # this.defaults
      #   eventTimeout: 60 * 1000     # 60 seconds

      # type  #{Boolean}  created   视图是否已创建
      created: false
      # type  #{Boolean}  started   视图是否已启动
      started: false
      # type  #{Boolean}  created   视图是否已初始化
      initialized: false
      # type  #{Boolean}  started   视图是否允许操作
      locked: false

      constructor: (app, args=[]) ->
        if not app
          throw new exceptions.ValueError("app must be instance of Application")
        self = this
        self.constructor.prefix or= text.underscore(self.constructor.name)
        self.uid = utils.uniqueId(self.constructor.prefix)
        self.app = app
        self.args = args
        self.contents = {}
        self.containers = app.layout.containers

      ###
      Initialize UI components skeleton and append them to DOM Tree
      ###
      create: (fn) ->
        self = this
        return self if self.created
        logging.debug("Create view. #{self.uid}")
        self.lock()
        self.on('created', (e) -> fn(false, self)) if $.isFunction(fn)
        self.emit('create')

      ###
      Display UI components and then render them with data
      ###
      start: (fn) ->
        self = this
        throw new exceptions.ValueError("Must create view first.") if not self.created
        return self if self.started
        logging.debug("Start view. #{self.uid}")
        self.lock()
        self.on('started', (e) -> fn(false, self)) if $.isFunction(fn)
        self.emit('start')

      ###
      Update UI components when URL changes
      ###
      update: (fn) ->
        self = this
        logging.debug("Update view. #{self.uid}")
        self.on('updated', (e) -> fn(false, this)) if $.isFunction(fn)
        self.emit('update')

      ###
      Hide UI components
      ###
      stop: (fn) ->
        self = this
        throw new exceptions.ValueError("Must create view first.") if not self.created
        return self if not self.started
        logging.debug("Stop view. #{self.uid}")
        self.lock()
        self.on('stopped', (e) -> fn(false, self)) if $.isFunction(fn)
        self.emit('stop')

      ###
      Remove UI components from DOM Tree
      ###
      destroy: (fn) ->
        self = this
        throw new exceptions.ValueError("Must stop view first.") if self.started
        return self if not self.created
        logging.debug("Destroy view. #{self.uid}")
        self.lock()
        self.on('destroyed', (e) -> fn(false, self)) if $.isFunction(fn)
        self.emit('destroy')

      lock: (fn) ->
        self = this
        return self if self.locked
        logging.debug("Lock view. #{self.uid}")
        self.locked = true
        self.emit 'lock'
        fn(false, self) if $.isFunction(fn)
        self

      unlock: (fn) ->
        self = this
        return self unless self.locked
        logging.debug("Unlock view. #{self.uid}")
        self.locked = false
        self.emit 'unlock'
        fn(false, self) if $.isFunction(fn)
        self

      ###
      事件的模板方法

      @param  {Function}    成功时的回调
      @return {Boolean|Promise}
      ###
      oncreate: (e) ->
        self = this
        # create contents and append them to container asynchronously
        for name, container of self.containers
          if name of self.constructor._contents
            content = self.contents[name] = new self.constructor._contents[name](self)
            container.append(content)

        self.created = true
        self.unlock()
        logging.debug("View created. #{self.uid}")
        self.emit 'created'

      onstart: (e) ->
        self = this
        # Show contents asynchronously
        for name, container of self.containers
          if name of self.contents
            container.load(self.contents[name])
          else
            container.hide()

        self.started = true
        self.unlock()
        if not self.initialized
          logging.debug("Initialize view. #{self.uid}")
          self.emit 'initialize'
        logging.debug("View started. #{self.uid}")
        self.emit 'started'

      oninitialize: (e) ->
        self = this
        # Initialize contents asynchronously
        for name, container of self.containers
          if name of self.contents
            self.contents[name].initialize()

        self.initialized = true
        logging.debug("View initialized. #{self.uid}")
        self.emit 'initialized'

      onupdate: (e) ->
        logging.debug("View updated. #{self.uid}")
        this.emit 'updated'

      onstop: (e) ->
        self = this
        self.started = false
        self.unlock()
        logging.debug("View stopped. #{self.uid}")
        self.emit 'stopped'

      ondestroy: (e) ->
        self = this
        self.created = false
        self.unlock()
        logging.debug("View destroyed. #{self.uid}")
        self.emit 'destroyed'

    exports.View = View
