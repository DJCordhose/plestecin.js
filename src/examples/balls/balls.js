/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/facade/game.ts" />
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
var Balls;
(function (Balls) {
    var mixin = Plestecin.Util.mixin;
    var Game = Plestecin.Game;
    var MovingObject = Plestecin.MovingObject;
    var Ball = Plestecin.Ball;
    var PhysicsEngine = Plestecin.PhysicsEngine;
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(eventBus, gameCanvas, keyboadControl, config) {
            var _this = _super.call(this, eventBus, gameCanvas, config) || this;
            _this.keyboadControl = keyboadControl;
            _this.color = config.color;
            return _this;
        }
        Player.prototype.accelerate = function (deltaT) {
            var currentControl = this.keyboadControl.cursorControl();
            if ('up' in currentControl)
                this.velocity.y -= this.acceleration * deltaT;
            if ('down' in currentControl)
                this.velocity.y += this.acceleration * deltaT;
            if ('left' in currentControl)
                this.velocity.x -= this.acceleration * deltaT;
            if ('right' in currentControl)
                this.velocity.x += this.acceleration * deltaT;
        };
        Player.prototype.update = function (deltaT) {
            this.accelerate(deltaT);
            this.inertiaMove(deltaT);
        };
        return Player;
    }(MovingObject));
    Balls.Player = Player;
    mixin(Player, Ball);
    var BallGame = /** @class */ (function (_super) {
        __extends(BallGame, _super);
        function BallGame() {
            var _this = _super.call(this, 'balls') || this;
            _this.gameOver = false;
            _this.greenBallLikeliness = 0.1;
            _this.redBallLikeliness = 0.01;
            _this.description = 'Hit green balls and avoid red ones. Accelerate by using cursor keys.';
            return _this;
        }
        BallGame.prototype.createBall = function (color) {
            var r = BallGame.ballRadius;
            var ball = new Ball(this.gameCanvas, {
                position: {
                    x: Math.round(Math.random() * (this.gameCanvas.canvas.width - 4 * r) + 2 * r),
                    y: Math.round(Math.random() * (this.gameCanvas.canvas.height - 4 * r) + 2 * r)
                },
                r: r,
                color: color
            });
            this.engine.addObject(ball);
            return ball;
        };
        BallGame.prototype.createGreenBall = function () {
            var _this = this;
            var ball = this.createBall('green');
            this.physicsEngine.onCollision({
                object1: ball,
                object2: this.player,
                callback: function () {
                    _this.playSoundGood();
                    _this.currentScore++;
                    _this.engine.removeObject(ball);
                }
            });
        };
        BallGame.prototype.createRedBall = function () {
            var _this = this;
            // TODO
            var ball = this.createBall('red');
            // don't immediately collide with player
            var playerWithExtendedRadius = {
                position: {
                    x: this.player.position.x,
                    y: this.player.position.y
                },
                r: this.player.r * 5
            };
            if (PhysicsEngine.circleCollidesWithCircle(ball, playerWithExtendedRadius)) {
                this.engine.removeObject(ball);
            }
            else {
                this.physicsEngine.onCollision({
                    object1: ball,
                    object2: this.player,
                    callback: function () {
                        _this.loose();
                    }
                });
            }
        };
        BallGame.prototype.loose = function () {
            this.playSoundBad();
            this.gameOver = true;
            this.engine.stop();
        };
        BallGame.prototype.render = function () {
            var newHighscore = this.updateHighscore();
            var text;
            if (this.gameOver) {
                text = (newHighscore ? 'Game over, NEW HIGHSCORE: ' : 'Game over, final score: ') + this.currentScore;
            }
            else {
                text = "Score: " + this.currentScore;
            }
            this.gameCanvas.context.fillStyle = 'black';
            this.gameCanvas.context.font = '12px sans-serif';
            this.gameCanvas.context.fillText(text, 20, this.gameCanvas.canvas.height - 20);
            this.gameCanvas.context.fillText(this.description + ' Reload page to try again. Current high score: ' + this.currentHighscore(), 20, 20);
        };
        BallGame.prototype.update = function () {
            if (Math.random() < this.greenBallLikeliness)
                this.createGreenBall();
            if (Math.random() < this.redBallLikeliness)
                this.createRedBall();
        };
        BallGame.ballRadius = 10;
        return BallGame;
    }(Game));
    Balls.BallGame = BallGame;
})(Balls || (Balls = {}));
//# sourceMappingURL=balls.js.map