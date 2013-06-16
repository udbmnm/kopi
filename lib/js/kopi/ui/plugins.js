(function() {

  define("kopi/ui/plugins", function(require, exports, module) {
    var $, app;
    $ = require("jquery");
    app = require("kopi/app");
    $.fn.navlink = function() {
      if (!this.length) {
        return this;
      }
      return this.each(function() {
        var link, url;
        link = $(this);
        url = link.attr('href') || link.data('url');
        if (url) {
          return link.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            return app.instance().load(url);
          });
        }
      });
    };
  });

}).call(this);
