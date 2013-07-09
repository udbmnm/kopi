(function() {

  define("kopi/tests/db/adapters/memory", function(require, exports, module) {
    var fixtures, memory, q, storage;
    q = require("qunit");
    fixtures = require("kopi/tests/db/fixtures");
    memory = require("kopi/db/adapters/memory");
    storage = require("kopi/utils/storage").memoryStorage;
    fixtures.User.adapter("client", memory.MemoryAdapter, {
      primary: true
    });
    q.module("kopi/db/adapters/memory");
    q.test("create user", function() {
      var registerAt, user;
      registerAt = new Date(2012, 2, 1, 20);
      user = new fixtures.User({
        id: 1,
        name: "Alpha",
        email: "alpha@gmail.com",
        registerAt: registerAt
      });
      q.stop();
      return user.save(function(error, obj) {
        var key, value;
        q.equal(obj.guid, user.guid);
        q.equal(obj.id, 1);
        q.equal(obj.name, "Alpha");
        q.equal(obj.email, "alpha@gmail.com");
        q.equal(obj.registerAt.getTime(), registerAt.getTime());
        key = "kopi:user:1";
        value = storage.getItem(key);
        q.equal(value.id, 1);
        q.equal(value.name, "Alpha");
        q.equal(value.email, "alpha@gmail.com");
        q.equal(value.registerAt.getTime(), registerAt.getTime());
        return q.start();
      });
    });
    q.test("retrieve one user", function() {
      var registerAt;
      registerAt = new Date(2012, 2, 1, 20);
      q.stop();
      return fixtures.User.where({
        id: 1
      }).one(function(error, user) {
        q.equal(user.id, 1);
        q.equal(user.name, "Alpha");
        q.equal(user.email, "alpha@gmail.com");
        q.equal(user.registerAt.getTime(), registerAt.getTime());
        return q.start();
      });
    });
    q.test("update user", function() {
      var registerAt, user;
      registerAt = new Date(2012, 2, 2, 20);
      user = new fixtures.User({
        id: 2,
        name: "Beta",
        email: "beta@gmail.com",
        registerAt: new Date(2012, 2, 2, 10)
      });
      q.stop();
      return user.save(function(error, obj) {
        return fixtures.User.where({
          id: 2
        }).one(function(error, user) {
          console.log(user);
          user.name = "Gamma";
          user.email = "gamma@gmail.com";
          user.registerAt = registerAt;
          return user.save(function(error) {
            var key, value;
            q.equal(user.name, "Gamma");
            q.equal(user.email, "gamma@gmail.com");
            q.equal(user.registerAt.getTime(), registerAt.getTime());
            key = "kopi:user:2";
            value = storage.getItem(key);
            q.equal(value.id, 2);
            q.equal(value.name, "Gamma");
            q.equal(value.email, "gamma@gmail.com");
            q.equal(value.registerAt.getTime(), registerAt.getTime());
            return q.start();
          });
        });
      });
    });
    return q.test("destroy user", function() {
      q.stop();
      return fixtures.User.where({
        id: 1
      }).one(function(error, user) {
        return user.destroy(function(error) {
          var key, value;
          key = "kopi:user:1";
          value = storage.getItem(key);
          q.equal(value, null);
          return q.start();
        });
      });
    });
  });

}).call(this);
