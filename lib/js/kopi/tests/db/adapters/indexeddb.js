(function() {

  define("kopi/tests/db/adapters/indexeddb", function(require, exports, module) {
    var CHRISMAS, NEW_YEAR, User, VALENTINE, countUsers, destroyOneUser, ensureUser, ensureUsers, fixtures, indexeddb, q, retrieveAllUsers, retrieveOneUser, retrieveUsersWithAdvancedQuerying, settings, updateOneUser;
    q = require("qunit");
    settings = require("kopi/settings");
    fixtures = require("kopi/tests/db/fixtures");
    indexeddb = require("kopi/db/adapters/indexeddb");
    User = fixtures.User;
    User.adapter("client", indexeddb.IndexedDBAdapter, {
      primary: true
    });
    CHRISMAS = new Date(2012, 12, 25, 20);
    NEW_YEAR = new Date(2012, 1, 1, 20);
    VALENTINE = new Date(2012, 2, 14, 20);
    ensureUser = function(id, name, email, registerAt, fn) {
      return User.where({
        id: id
      }).one(function(error, user) {
        if (error || user) {
          if (fn) {
            fn(error, user);
          }
          return;
        }
        user = new User({
          id: id,
          name: name,
          email: email,
          registerAt: registerAt
        });
        return user.save(fn);
      });
    };
    ensureUsers = function(fn) {
      return ensureUser(1, "Alpha", "alpha@gmail.com", CHRISMAS, function() {
        return ensureUser(2, "Beta", "beta@gmail.com", VALENTINE, function() {
          return ensureUser(3, "Delta", "delta@gmail.com", NEW_YEAR, function() {
            return fn();
          });
        });
      });
    };
    countUsers = function(fn) {
      return User.count(function(error, count) {
        q.equals(count, 3);
        if (fn) {
          return fn();
        }
      });
    };
    retrieveOneUser = function(fn) {
      return User.where({
        id: 3
      }).one(function(error, user) {
        q.equals(user.id, 3);
        q.equals(user.name, "Delta");
        q.equals(user.email, "delta@gmail.com");
        q.equals(user.registerAt.getTime(), NEW_YEAR.getTime());
        if (fn) {
          return fn();
        }
      });
    };
    retrieveAllUsers = function(fn) {
      return User.all(function(error, users) {
        q.equals(users.length, 3);
        q.equals(users[0].id, 1);
        q.equals(users[2].id, 3);
        return User.sort({
          id: false
        }).all(function(error, users) {
          q.equals(users.length, 3);
          q.equals(users[0].id, 3);
          q.equals(users[2].id, 1);
          return User.skip(1).all(function(error, users) {
            q.equals(users.length, 2);
            q.equals(users[0].id, 2);
            q.equals(users[1].id, 3);
            return User.limit(1).all(function(error, users) {
              q.equals(users.length, 1);
              q.equals(users[0].id, 1);
              if (fn) {
                return fn();
              }
            });
          });
        });
      });
    };
    retrieveUsersWithAdvancedQuerying = function(fn) {
      return User.where({
        id: {
          gte: 2
        }
      }).all(function(error, users) {
        q.equals(users.length, 2);
        q.equals(users[0].id, 2);
        q.equals(users[1].id, 3);
        return User.where({
          name: {
            lt: "Beta"
          }
        }).all(function(error, users) {
          q.equals(users.length, 1);
          q.equals(users[0].id, 1);
          return User.where({
            registerAt: {
              gt: NEW_YEAR,
              lte: CHRISMAS
            }
          }).all(function(error, users) {
            q.equals(users.length, 2);
            if (fn) {
              return fn();
            }
          });
        });
      });
    };
    updateOneUser = function(fn) {
      return User.where({
        id: 2
      }).one(function(error, user) {
        user.name = "Gamma";
        user.email = "gamma@gmail.com";
        return user.save(function(error) {
          var req;
          q.equals(user.name, "Gamma");
          q.equals(user.email, "gamma@gmail.com");
          req = indexedDB.open(settings.kopi.db.indexedDB.name);
          return req.onsuccess = function() {
            var db, store, trans;
            db = req.result;
            trans = db.transaction([User.dbName()]);
            store = trans.objectStore(User.dbName());
            req = store.get(user.id);
            return req.onsuccess = function(e) {
              var value;
              value = req.result;
              q.equals(value.id, 2);
              q.equals(value.name, "Gamma");
              q.equals(value.email, "gamma@gmail.com");
              if (fn) {
                return fn();
              }
            };
          };
        });
      });
    };
    destroyOneUser = function(fn) {
      return fixtures.User.where({
        id: 1
      }).one(function(error, user) {
        return user.destroy(function(error) {
          var req;
          req = indexedDB.open(settings.kopi.db.indexedDB.name);
          return req.onsuccess = function() {
            var db, store, trans;
            db = req.result;
            trans = db.transaction([User.dbName()]);
            store = trans.objectStore(User.dbName());
            req = store.get(user.id);
            return req.onsuccess = function(e) {
              q.ok(!req.result);
              if (fn) {
                return fn();
              }
            };
          };
        });
      });
    };
    return User.init(function() {
      return ensureUsers(function() {
        q.module("kopi/db/adapters/indexeddb");
        q.test("count users", function() {
          q.stop();
          return countUsers(function() {
            return q.start();
          });
        });
        q.test("retrieve one user", function() {
          q.stop();
          return retrieveOneUser(function() {
            return q.start();
          });
        });
        q.test("retrieve all users", function() {
          q.stop();
          return retrieveAllUsers(function() {
            return q.start();
          });
        });
        q.test("retrieve users with advanced querying", function() {
          q.stop();
          return retrieveUsersWithAdvancedQuerying(function() {
            return q.start();
          });
        });
        q.test("update one user", function() {
          q.stop();
          return updateOneUser(function() {
            return q.start();
          });
        });
        return q.test("destroy one user", function() {
          q.stop();
          return destroyOneUser(function() {
            return q.start();
          });
        });
      });
    });
  });

}).call(this);
