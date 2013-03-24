(function() {

  define("kopi/tests/utils/text", function(require, exports, module) {
    var base, q, text;
    q = require("qunit");
    base = require("kopi/tests/base");
    text = require("kopi/utils/text");
    q.module("kopi.utils.text");
    return q.test("pluralize", function() {
      q.equals(text.pluralize(''), '');
      q.equals(text.pluralize('goose'), 'geese');
      q.equals(text.pluralize('dolly'), 'dollies');
      q.equals(text.pluralize('genius'), 'genii');
      q.equals(text.pluralize('jones'), 'joneses');
      q.equals(text.pluralize('pass'), 'passes');
      q.equals(text.pluralize('zero'), 'zeros');
      q.equals(text.pluralize('casino'), 'casinos');
      q.equals(text.pluralize('hero'), 'heroes');
      q.equals(text.pluralize('church'), 'churches');
      q.equals(text.pluralize('x'), 'xs');
      return q.equals(text.pluralize('car'), 'cars');
    });
  });

}).call(this);
