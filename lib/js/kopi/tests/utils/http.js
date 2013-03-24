(function() {

  define("kopi/tests/utils/http", function(require, exports, module) {
    var http, q, urls;
    q = require("qunit");
    http = require("kopi/utils/http");
    q.module("kopi.utils.http");
    urls = ["/images/icon1.png", "/images/icon2.png", "/images/icon3.png", "/images/icon4.png", "/images/icon5.png"];
    return q.test("queued requests", function() {
      var i, req, url, _i, _len;
      http.queue.configure({
        concurrency: 1
      });
      http.queue.on(http.RequestQueue.EMPTY_EVENT, function(e) {
        q.equal(1, 1);
        return q.start();
      });
      q.stop();
      for (i = _i = 0, _len = urls.length; _i < _len; i = ++_i) {
        url = urls[i];
        req = http.request({
          url: url,
          queue: true
        });
      }
      return http.queue.abort(req);
    });
  });

}).call(this);
