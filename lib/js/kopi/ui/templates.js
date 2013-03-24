(function() {

  define("kopi/ui/templates", function(require, exports, module) {
    var $, SimpleTemplate, simple, text;
    $ = require("jquery");
    text = require("kopi/utils/text");
    /*
      Interface for all template engines
    
      class Template
    
        constructor: ->
    
        render: (data) ->
    */

    /*
      Simple template engine
    */

    SimpleTemplate = (function() {

      function SimpleTemplate(template) {
        if (template == null) {
          template = "";
        }
        this._template = template;
      }

      SimpleTemplate.prototype.render = function(data) {
        if (data == null) {
          data = {};
        }
        return text.format(this._template, data);
      };

      return SimpleTemplate;

    })();
    simple = function(template, data) {
      return new SimpleTemplate(template).render(data);
    };
    return {
      SimpleTemplate: SimpleTemplate,
      simple: simple
    };
  });

}).call(this);
