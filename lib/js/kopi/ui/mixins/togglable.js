// Generated by CoffeeScript 1.3.1
(function() {

  define("kopi/ui/mixins/togglable", function(require, exports, module) {
    /*
      Add show/hide method to class
    */

    var Togglable;
    Togglable = (function() {

      Togglable.name = 'Togglable';

      function Togglable() {}

      Togglable.prototype.show = function() {
        if (!this.hidden) {
          return this;
        }
        this.hidden = false;
        this.element.addClass(this.constructor.cssClass("show"));
        return this;
      };

      Togglable.prototype.hide = function() {
        if (this.hidden) {
          return this;
        }
        this.hidden = true;
        this.element.removeClass(this.constructor.cssClass("show"));
        return this;
      };

      return Togglable;

    })();
    return {
      Togglable: Togglable
    };
  });

}).call(this);