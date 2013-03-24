(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/tests/db/fixtures", function(require, exports, module) {
    var Article, Blog, Tag, User, models;
    models = require("kopi/db/models");
    User = (function(_super) {

      __extends(User, _super);

      function User() {
        return User.__super__.constructor.apply(this, arguments);
      }

      User.field("id", {
        type: models.INTEGER,
        primary: true
      });

      User.field("name");

      User.field("email");

      User.field("registerAt", {
        type: models.DATETIME
      });

      User.hasMany("Blog", {
        module: "kopi/tests/db/fixtures"
      });

      User.hasMany("Article", {
        module: "kopi/tests/db/fixtures"
      });

      User.index("name");

      User.index("email");

      User.index("registerAt");

      return User;

    })(models.Model);
    Tag = (function(_super) {

      __extends(Tag, _super);

      function Tag() {
        return Tag.__super__.constructor.apply(this, arguments);
      }

      Tag.field("id", {
        type: models.INTEGER,
        primary: true
      });

      Tag.field("name");

      Tag.hasMany("Article", {
        module: "kopi/tests/db/fixtures"
      });

      Tag.index("name");

      return Tag;

    })(models.Model);
    Article = (function(_super) {

      __extends(Article, _super);

      function Article() {
        return Article.__super__.constructor.apply(this, arguments);
      }

      Article.field("id", {
        type: models.INTEGER,
        primary: true
      });

      Article.field("title");

      Article.field("body", {
        type: models.TEXT
      });

      Article.field("publishedAt", {
        type: models.DATETIME
      });

      Article.field("updatedAt", {
        type: models.DATETIME
      });

      Article.belongsTo("Blog", {
        module: "kopi/tests/db/fixtures"
      });

      Article.belongsTo(User, {
        name: "author"
      });

      Article.hasMany(Tag, {
        name: "categories"
      });

      Article.index("title");

      return Article;

    })(models.Model);
    Blog = (function(_super) {

      __extends(Blog, _super);

      function Blog() {
        return Blog.__super__.constructor.apply(this, arguments);
      }

      Blog.field("id", {
        type: models.INTEGER,
        primary: true
      });

      Blog.field("title", {
        type: models.STRING
      });

      Blog.index("title");

      return Blog;

    })(models.Model);
    Article.belongsTo(Blog);
    return {
      User: User,
      Tag: Tag,
      Article: Article,
      Blog: Blog
    };
  });

}).call(this);
