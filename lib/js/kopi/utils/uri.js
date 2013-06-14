(function() {
  define("kopi/utils/uri", function(require, exports, module) {
    var $, absolute, array, base, baseURI, build, cur, current, decode, doc, emp, exceptions, goto, join, loc, object, par, parse, reHost, rePath, reURL, relative, removeDotSegments, sep, text, unjoin, unparse;

    $ = require("jquery");
    exceptions = require("kopi/exceptions");
    array = require("kopi/utils/array");
    object = require("kopi/utils/object");
    text = require("kopi/utils/text");
    doc = document;
    loc = location;
    sep = '/';
    cur = '.';
    par = '..';
    emp = '';
    /*
    Convert a relative URL into an absolute URI
    */

    absolute = function(url, baseURL) {
      if (!baseURL) {
        baseURL = base();
      }
      return join(baseURL, url);
    };
    /*
    Convert an absolute URI into a relative URI
    */

    relative = function(url, baseURL) {
      if (!baseURL) {
        baseURL = current();
      }
      return unjoin(baseURL, url);
    };
    /*
    Get baseURI of current page
    */

    baseURI = null;
    base = function() {
      var tag;

      if (baseURI) {
        return baseURI;
      }
      if (doc.baseURI) {
        baseURI = parse(doc.baseURI);
        return baseURI;
      }
      tag = $('head > base');
      if (tag.length) {
        baseURI = parse(join(loc.href, tag.attr("href")));
        return baseURI;
      }
      return baseURI = parse(loc.href);
    };
    /*
    Get current URL
    */

    current = function() {
      return loc.href;
    };
    decode = function(value) {
      if (value) {
        return decodeURIComponent(value);
      } else {
        return emp;
      }
    };
    reHost = /^([^:\/#\?]+):\/\//;
    /*
    Build path similar to Rails router
    */

    build = function(path, options) {
      if (options == null) {
        options = {};
      }
      if (!(array.isArray(path) && path.length >= 1)) {
        throw new exceptions.ValueError("Path must be an non-empty array");
      }
      if (options.format != null) {
        path = path.concat([cur, options.format]);
      }
      if (options.params != null) {
        if (object.isObject(options.params)) {
          options.params = "?" + ($.param(options.params));
        }
        path.push(options.params);
      }
      if (options.host != null) {
        if (options.host === true) {
          options.host = "" + loc.protocol + "//" + loc.host;
        } else if (!options.host.match(reHost)) {
          options.host = "" + loc.protocol + "//" + options.host;
        }
        path.unshift(options.host);
      }
      return path.join(emp);
    };
    goto = function(url) {
      return loc.href = url;
    };
    /*
    Resolves a relative URL string to base URI
    */

    join = function(base, url) {
      var lastSlashIndex, overridden, path;

      if (!base) {
        return url;
      }
      if (!url) {
        return base;
      }
      if (text.isString(base)) {
        base = parse(base);
      }
      if (text.isString(url)) {
        url = parse(url);
      }
      overridden = url.scheme;
      if (overridden) {
        base.scheme = url.scheme;
      } else {
        overridden = url.authority;
      }
      if (overridden) {
        base.authority = url.authority;
      } else {
        overridden = url.path;
      }
      if (overridden) {
        path = url.path;
        if (path.charAt(0) !== sep) {
          if (base.authority && !base.path) {
            path = sep + path;
          } else {
            lastSlashIndex = base.path.lastIndexOf(sep);
            if (lastSlashIndex !== -1) {
              path = base.path.substr(0, lastSlashIndex + 1) + path;
            }
          }
        }
        base.path = removeDotSegments(path);
      } else {
        overridden = url.query;
      }
      if (overridden) {
        base.query = url.query;
      } else {
        overridden = url.fragment;
      }
      if (overridden) {
        base.fragment = url.fragment;
      }
      return unparse(base);
    };
    /*
    Removes dot segments in given path component, as described in
    RFC 3986, section 5.2.4.
    */

    removeDotSegments = function(path) {
      var i, length, results, segment, segments, _i, _len;

      if (path === par || path === cur) {
        return emp;
      }
      if (!(text.contains(path, "./") || text.contains(path, "/."))) {
        return path;
      }
      absolute = text.startsWith(path, sep);
      segments = path.split(sep);
      length = segments.length;
      results = [];
      for (i = _i = 0, _len = segments.length; _i < _len; i = ++_i) {
        segment = segments[i];
        if (segment === cur) {
          if (absolute && i === length) {
            results.push(emp);
          }
        } else if (segment === par) {
          if (results.length > 1 || results.length === 1 && results[0] !== emp) {
            results.pop();
          }
          if (absolute && i === length) {
            results.push(emp);
          }
        } else {
          results.push(segment);
          absolute = true;
        }
      }
      return results.join(sep);
    };
    /*
    Return a relative URL string from base URI
    
    TODO Move some common methods to path module
    */

    unjoin = function(base, url) {
      var basePath, count, filename, i, lastSlashIndex, path, x, _i;

      if (!base) {
        return url;
      }
      if (!url) {
        return base;
      }
      if (text.isString(base)) {
        base = parse(base);
      }
      if (text.isString(url)) {
        url = parse(url);
      }
      if (base.scheme !== url.scheme || base.authority !== url.authority) {
        return unparse(url);
      }
      lastSlashIndex = base.path.lastIndexOf(sep);
      if (lastSlashIndex !== -1) {
        basePath = base.path.substr(0, lastSlashIndex + 1);
      }
      lastSlashIndex = url.path.lastIndexOf(sep);
      if (lastSlashIndex !== -1) {
        path = url.path.substr(0, lastSlashIndex + 1);
        filename = url.path.substr(lastSlashIndex + 1, url.path.length);
      }
      basePath = (function() {
        var _i, _len, _ref, _results;

        _ref = basePath.split(sep);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x) {
            _results.push(x);
          }
        }
        return _results;
      })();
      path = (function() {
        var _i, _len, _ref, _results;

        _ref = path.split(sep);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x) {
            _results.push(x);
          }
        }
        return _results;
      })();
      count = Math.min(basePath.length, path.length);
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        if (basePath[i] !== path[i]) {
          count = i;
          break;
        }
      }
      relative = array.fill([], par, basePath.length - count).concat(path.slice(count, path.length));
      relative.push(filename);
      url.scheme = "";
      url.authority = "";
      url.path = relative.join(sep);
      return unparse(url);
    };
    /*
    This scary looking regular expression parses an absolute URL or its relative
    variants (protocol, site, document, query, and hash), into the various
    components (protocol, host, path, query, fragment, etc that make up the
    URL as well as some other commonly used sub-parts. When used with RegExp.exec()
    or String.match, it parses the URL into a results array that looks like this:
    
        [0]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread#msg-content
        [1]: http://jblas:password@mycompany.com:8080/mail/inbox?msg=1234&type=unread
        [2]: http://jblas:password@mycompany.com:8080/mail/inbox
        [3]: http://jblas:password@mycompany.com:8080
        [4]: http:
        [5]: jblas:password@mycompany.com:8080
        [6]: jblas:password
        [7]: jblas
        [8]: password
        [9]: mycompany.com:8080
       [10]: mycompany.com
       [11]: 8080
       [12]: /mail/inbox
       [13]: /mail/
       [14]: inbox
       [15]: ?msg=1234&type=unread
       [16]: #msg-content
    */

    reURL = /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
    rePath = /^\//;
    /*
    Parse a URL into a structure that allows easy access to
    all of the URL components by name.
    */

    parse = function(url) {
      var matches, results;

      if (typeof url === "object") {
        return url;
      }
      results = {};
      matches = reURL.exec(url || emp) || [];
      results = {
        url: matches[0] || emp,
        urlNoHash: matches[1] || emp,
        urlNoQuery: matches[2] || emp,
        domain: matches[3] || emp,
        scheme: matches[4] || emp,
        authority: matches[5] || emp,
        user: matches[6] || emp,
        username: matches[7] || emp,
        password: matches[8] || emp,
        host: matches[9] || emp,
        hostname: matches[10] || emp,
        port: matches[11] || emp,
        path: matches[12] || emp,
        directory: matches[13] || emp,
        filename: matches[14] || emp,
        query: matches[15] || emp,
        fragment: matches[16] || emp
      };
      return results;
    };
    unparse = function(obj) {
      var url;

      url = emp;
      if (obj.scheme) {
        url += obj.scheme;
      }
      if (obj.authority) {
        url += "//" + obj.authority;
      }
      if (obj.path) {
        url += obj.path;
      }
      if (obj.query) {
        url += obj.query;
      }
      if (obj.fragment) {
        url += obj.fragment;
      }
      return url;
    };
    return {
      absolute: absolute,
      relative: relative,
      base: base,
      current: current,
      build: build,
      join: join,
      unjoin: unjoin,
      parse: parse,
      unparse: unparse
    };
  });

}).call(this);
