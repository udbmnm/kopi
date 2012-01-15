kopi.module("kopi.db.queries")
  .require("kopi.exceptions")
  .require("kopi.utils")
  .require("kopi.utils.number")
  .require("kopi.utils.object")
  .require("kopi.db.models")
  .define (exports, exceptions, utils, number, object, models) ->

    CREATE = "create"
    RETRIEVE = "retrieve"
    UPDATE = "update"
    DESTROY = "destroy"
    RAW = "raw"
    ACTIONS = [CREATE, RETRIEVE, UPDATE, DESTROY, RAW]

    ONLY = "only"
    WHERE = "where"
    SORT = "sort"
    SKIP = "skip"
    LIMIT = "limit"
    COUNT = "count"

    LT = "lt"
    LTE = "lte"
    GT = "gt"
    GTE = "gte"
    EQ = "eq"
    NE = "ne"
    IN = "in"
    IS = "IS"
    LIKE = "LIKE"
    ILIKE = "ILIKE"

    ###
    Kopi provides a query API similar to MongoDB.

    Define a query to retrieve books which are collected by some user

      base = new RetrieveQuery(Book)
        .only("sid", "title")
        .where(userId: user.sid)
        .sort(collectedAt: false)
      count = base.clone()
        .count(true)
      query = base.clone()
        .skip(10)
        .limit(10)

    Define a query to create a comment of a book
      query = new CreateQuery(Comment)
        .attrs(bookId: book.sid, body: "Then again")

    Define a query to update multiple comments
      query = new UpdateQuery(Comment)
        .where(userId: user.sid, bookId: book.sid)
        .attrs(privacy: Comment.PRIVACY_PUBLIC)

    ###
    class BaseQuery

      this.METHODS = []

      constructor: (model, criteria) ->
        cls = this.constructor
        self = this
        if not model
          throw new exceptions.ValueError("Model must be a subclass of kopi.db.models.Model")

        # Set default values
        self.model = model

        if criteria
          for method in cls.METHODS
            self[method](criteria[method]) if method of criteria

      action: -> this._action

      clone: -> throw new exceptions.NotImplementedError()

      # Generate AJAX params
      params: -> throw new exceptions.NotImplementedError()

      # Generate SQL statements
      sql: -> throw new exceptions.NotImplementedError()

      criteria: ->
        cls = this.constructor
        self = this
        criteria = {}
        for method in cls.METHODS
          value = self["_#{method}"]
          criteria[method] = value if value

      execute: (type, fn) ->
        self = this
        adapter = self.model.adapter(type)
        adapter[self._action](self, fn)
        this

    class CreateQuery extends BaseQuery

      constructor: (model, attrs={}) ->
        this._action = CREATE
        this._attrs = attrs
        super(model)

      attrs: (attrs) -> object.extend this._attrs, attrs if attrs

      params: -> {attrs: JSON.stringify(this._attrs)}

      clone: -> new this.constructor(this.model, this._attrs)

    class BaseRetriveQuery extends BaseQuery

      kls = this
      kls.METHODS = [WHERE, SKIP, LIMIT]
      kls.OPERATIONS = [LT, LTE, GT, GTE, EQ, NE, IN, IS, LIKE, ILIKE]

      constructor: (model, criteria) ->
        self = this
        self._where = {}
        self._skip = null
        self._limit = null
        super(model, criteria)

      where: (where) ->
        if where
          for field, operations of where
            unless this._isOpertions(operations)
              operations =
                eq: operations
            object.extend this._where[field], operations
        this

      # TODO Need to optimize performance
      _isOpertions: (obj) ->
        for operation in this.constructor.OPERATIONS
          return true if operation of obj
        false

      skip: (skip) ->
        if number.isNumber(skip)
          this._skip = skip
        this

      limit: (limit) ->
        if number.isNumber(limit)
          this._limit = limit
        this

      clone: ->
        cls = this.constructor
        self = this
        new cls(self.model, self.criteria())

      pk: ->
        self = this
        model = self.model
        criteria = self.criteria()
        try
          pk = criteria.pk.eq
        catch e
          try
            pk = criteria[model.pkName()].eq
          catch e
            pk = null
        pk

    class RetrieveQuery extends BaseRetriveQuery

      this.METHODS = [ONLY, WHERE, SORT, SKIP, LIMIT, COUNT]

      constructor: (model, criteria) ->
        self = this
        self._action = RETRIEVE
        self._only = null
        self._sort = null
        self._count = false
        super(model, criteria)

      only: ->
        if arguments.length
          this._only = arguments
        this

      sort: (sort) ->
        if sort
          object.extend this._sort, sort
        this

      count: (count) ->
        this._count = !!count
        this

      get: (type, fn) ->
        self = this
        adapter = self.model.adapter(type)
        adapter.retrieve(self, fn)
        self

    class UpdateQuery extends BaseRetriveQuery

      constructor: (model, criteria, attrs) ->
        this._action = UPDATE
        this._attrs = attrs
        super(model, criteria)

      attrs: (attrs) ->
        this._attrs = attrs if attrs
        this

      clone: ->
        cls = this.constructor
        self = this
        new cls(self.model, self.criteria(), self._attrs)

    class DestroyQuery extends BaseRetriveQuery

      constructor: (model, criteria) ->
        this._action = DESTROY
        super(model, criteria)

    class RawQuery extends BaseQuery

      constructor: (model, args...) ->
        this._action = RAW
        this._args = args
        super(model)

      clone: -> new this.constructor(this.model, this._args...)

    exports.CREATE = CREATE
    exports.RETRIEVE = RETRIEVE
    exports.UPDATE = UPDATE
    exports.DESTROY = DESTROY
    exports.RAW = RAW
    exports.ACTIONS = ACTIONS
    exports.CreateQuery = CreateQuery
    exports.RetrieveQuery = RetrieveQuery
    exports.UpdateQuery = UpdateQuery
    exports.DestroyQuery = DestroyQuery
    exports.RawQuery = RawQuery
