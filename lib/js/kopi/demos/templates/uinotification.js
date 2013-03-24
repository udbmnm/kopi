(function() {

  define("kopi/demos/templates/uinotification", function(require, exports, module) {
    var SimpleTemplate;
    SimpleTemplate = require("kopi/ui/templates").SimpleTemplate;
    return {
      notification: new SimpleTemplate("<div class=\"kopi-inner\">\n  <h2>Indicator</h2>\n  <p>Description</p>\n  <div class=\"indicator-section\">\n  </div>\n  <h2>Bubble</h2>\n  <p>Description</p>\n  <div class=\"bubble-section\">\n  </div>\n  <h2>Dialog</h2>\n  <p>Description</p>\n  <div class=\"dialog-section\">\n  </div>\n</div>")
    };
  });

}).call(this);
