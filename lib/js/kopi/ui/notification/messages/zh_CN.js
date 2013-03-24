(function() {

  define("kopi/ui/notification/messages/zh_CN", function(require, exports, module) {
    var i18n;
    i18n = require("kopi/utils/i18n");
    return i18n.define("zh_CN", {
      kopi: {
        notification: {
          messages: {
            title: "对话框",
            action: "确定",
            close: "取消",
            loading_title: "正在载入。。。",
            loading_content: "请稍等片刻。。。"
          }
        }
      }
    });
  });

}).call(this);
