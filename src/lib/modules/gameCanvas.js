/// <reference path="../core/plestecin.ts" />
/// <reference path="basicPhysics.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// TODO: Add double buffering
var Plestecin;
(function (Plestecin) {
    var GameCanvas = /** @class */ (function () {
        function GameCanvas(conf) {
            if (conf) {
                this.canvas = document.getElementById(conf.canvasId);
                if (conf.width) {
                    this.canvas.width = conf.width;
                }
                if (conf.height) {
                    this.canvas.height = conf.height;
                }
                this.context = this.canvas.getContext('2d');
            }
            else {
                this.fullsizeCanvas();
            }
        }
        GameCanvas.prototype.init = function (eventBus, success) {
            var _this = this;
            eventBus.on(Plestecin.Engine.PRE_RENDER_EVENT, function () { return _this.clearCanvas(); });
            success(this);
        };
        GameCanvas.prototype.clearCanvas = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        GameCanvas.prototype.fullsizeCanvas = function () {
            var _this = this;
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');
            // TODO add listener for change of size as well
            window.addEventListener("orientationchange", function () {
                _this.canvas.width = window.innerWidth;
                _this.canvas.height = window.innerHeight;
                _this.context = _this.canvas.getContext('2d');
            }, false);
        };
        return GameCanvas;
    }());
    Plestecin.GameCanvas = GameCanvas;
    var Ball = /** @class */ (function (_super) {
        __extends(Ball, _super);
        function Ball(gameCanvas, config) {
            var _this = _super.call(this, config) || this;
            _this.gameCanvas = gameCanvas;
            _this.color = config.color;
            return _this;
        }
        Ball.prototype.render = function () {
            this.gameCanvas.context.fillStyle = this.color;
            this.gameCanvas.context.beginPath();
            this.gameCanvas.context.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
            this.gameCanvas.context.fill();
            this.gameCanvas.context.closePath();
        };
        return Ball;
    }(Plestecin.PhysicalObject));
    Plestecin.Ball = Ball;
    var Sprite = /** @class */ (function (_super) {
        __extends(Sprite, _super);
        function Sprite(gameCanvas, config) {
            var _this = _super.call(this, config) || this;
            _this.gameCanvas = gameCanvas;
            _this.image = config.image;
            _this.imageInfo = config.imageInfo || {};
            if (typeof _this.imageInfo.sx === 'undefined') {
                _this.imageInfo.sx = 0;
            }
            if (typeof _this.imageInfo.sy === 'undefined') {
                _this.imageInfo.sy = 0;
            }
            if (typeof _this.imageInfo.sw === 'undefined') {
                _this.imageInfo.sw = _this.image.width;
            }
            if (typeof _this.imageInfo.sh === 'undefined') {
                _this.imageInfo.sh = _this.image.height;
            }
            if (typeof _this.imageInfo.dw === 'undefined') {
                _this.imageInfo.dw = _this.imageInfo.sw;
            }
            if (typeof _this.imageInfo.dh === 'undefined') {
                _this.imageInfo.dh = _this.imageInfo.sh;
            }
            return _this;
        }
        Sprite.prototype.render = function () {
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#drawImage()
            var dw = this.imageInfo.dw, dh = this.imageInfo.dh, 
            // calculate center coordinate, as image takes upper left coordinate
            dx = this.position.x - this.imageInfo.dw / 2, dy = this.position.y - this.imageInfo.dh / 2, sx = this.imageInfo.sx, sy = this.imageInfo.sy, sw = this.imageInfo.sw, sh = this.imageInfo.sh;
            this.gameCanvas.context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        };
        return Sprite;
    }(Plestecin.PhysicalObject));
    Plestecin.Sprite = Sprite;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=gameCanvas.js.map