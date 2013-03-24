(function() {

  define("kopi/ui/notification/messages/en", function(require, exports, module) {
    var i18n;
    i18n = require("kopi/utils/i18n");
    return i18n.define("en", {
      kopi: {
        notification: {
          messages: {
            title: "Dialog",
            action: "Confirm",
            close: "Cancel",
            loading_title: "Loading...",
            loading_content: "Please wait a moment..."
          }
        }
      }
    });
  });

}).call(this);
