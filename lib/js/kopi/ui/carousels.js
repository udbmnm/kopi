(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define("kopi/ui/carousel", function(require, exports, module) {
    var Carousel, CarouselPage, Image, flippers, klass;
    klass = require("kopi/utils/klass");
    flippers = require("kopi/ui/flippers");
    Image = require("kopi/ui/images").Image;
    CarouselPage = (function(_super) {

      __extends(CarouselPage, _super);

      CarouselPage.widgetName("CarouselPage");

      function CarouselPage() {
        CarouselPage.__super__.constructor.apply(this, arguments);
        this.register("image", Image, {
          loadSrc: "/images/kopi/loader.gif",
          width: 480,
          height: 320
        });
      }

      return CarouselPage;

    })(flippers.FlipperPage);
    Carousel = (function(_super) {

      __extends(Carousel, _super);

      function Carousel() {
        return Carousel.__super__.constructor.apply(this, arguments);
      }

      Carousel.widgetName("Carousel");

      Carousel.configure({
        childClass: CarouselPage
      });

      return Carousel;

    })(flippers.Flipper);
    return {
      CarouselPage: CarouselPage,
      Carousel: Carousel
    };
  });

}).call(this);
