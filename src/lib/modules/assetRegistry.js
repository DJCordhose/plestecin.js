/// <reference path="../core/plestecin.ts" />
var Plestecin;
(function (Plestecin) {
    var AssetRegistry = (function () {
        function AssetRegistry() {
            this.images = {};
            this.imageRequests = {};
        }
        AssetRegistry.prototype.init = function (eventBus, success, error) {
            this.loadImages(success, error);
        };
        AssetRegistry.prototype.loadImage = function (name, url) {
            this.imageRequests[name] = url;
        };
        AssetRegistry.prototype.loadImages = function (success, error) {
            var _this = this;
            var imagesLoadedCnt = Object.keys(this.imageRequests).length;
            for (var name in this.imageRequests) {
                var image = new Image();
                image.src = this.imageRequests[name];
                image.onload = function () {
                    imagesLoadedCnt--;
                    if (imagesLoadedCnt === 0) {
                        success(_this);
                    }
                };
                this.images[name] = image;
            }
        };
        return AssetRegistry;
    })();
    Plestecin.AssetRegistry = AssetRegistry;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=assetRegistry.js.map