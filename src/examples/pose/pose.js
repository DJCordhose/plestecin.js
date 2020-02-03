/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/core/util.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/modules/assetRegistry.ts" />
/// <reference path="../../lib/modules/gameCanvas.ts" />
/// <reference path="../balls/balls.ts" />
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
var Pose;
(function (Pose) {
    var mixin = Plestecin.Util.mixin;
    var Sprite = Plestecin.Sprite;
    var Engine = Plestecin.Engine;
    var Game = Plestecin.Game;
    var PhysicsEngine = Plestecin.PhysicsEngine;
    var Player = /** @class */ (function (_super) {
        __extends(Player, _super);
        function Player(eventBus, assetRegistry, gameCanvas, keyboadControl) {
            var _this = this;
            var config = {
                image: assetRegistry.images['player'],
                imageInfo: {
                    dh: 60, dw: 60
                },
                r: 23,
                color: 'black',
                maxSpeed: 2,
                position: {
                    x: 100,
                    y: 100
                },
                gravity: 0.01,
                acceleration: 0.05,
                friction: 0.0001
            };
            _this = _super.call(this, eventBus, gameCanvas, keyboadControl, config) || this;
            Sprite.call(_this, _this.gameCanvas, config);
            _this.initialWeight = 80;
            _this.initialGravity = _this.gravity;
            return _this;
        }
        Player.prototype.accelerateViaPosition = function (deltaT) {
            var posePrediction = window.prediction;
            console.log(posePrediction);
            if ('up' === posePrediction)
                this.velocity.y -= this.acceleration * deltaT;
            if ('down' === posePrediction)
                this.velocity.y += this.acceleration * deltaT;
            if ('left' === posePrediction)
                this.velocity.x -= this.acceleration * deltaT;
            if ('right' === posePrediction)
                this.velocity.x += this.acceleration * deltaT;
        };
        Player.prototype.update = function (deltaT) {
            _super.prototype.update.call(this, deltaT);
            this.accelerateViaPosition(deltaT);
        };
        Player.prototype.grow = function (amount) {
            //            const addedsize = amount / 20;
            var addedsize = amount / 10;
            this.imageInfo.dh += addedsize / 2;
            this.imageInfo.dw += addedsize;
            this.r += addedsize / 2;
            //            this.gravity += amount / 100000;
            this.gravity += amount / 50000;
            //            console.log("Gravity: " + this.gravity);
            //            console.log("dh: " + this.imageInfo.dh);
            //            console.log("dw: " + this.imageInfo.dw);
        };
        Player.prototype.weightGain = function () {
            return ((this.gravity - this.initialGravity) * this.initialWeight * 1 / this.initialGravity).toFixed(2);
        };
        return Player;
    }(Balls.Player));
    Pose.Player = Player;
    mixin(Player, Plestecin.Sprite);
    var PoseGame = /** @class */ (function (_super) {
        __extends(PoseGame, _super);
        function PoseGame() {
            var _this = _super.call(this, "Pose", "field") || this;
            _this.assetRegistry.loadImage('player', 'images/wurfram.png');
            _this.assetRegistry.loadImage('enemy', 'images/apple.png');
            _this.assetRegistry.loadImage('food1', 'images/pizza.png');
            _this.assetRegistry.loadImage('food2', 'images/wurst.png');
            _this.assetRegistry.loadImage('food3', 'images/beer-gold.png');
            _this.engine.addState(Engine.initState(PoseGame.INTRO_STATE));
            _this.engine.addState(Engine.initState(PoseGame.GAME_OVER_STATE));
            _this.engine.addState(Engine.initState(PoseGame.PAUSE_STATE));
            _this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, function () { return _this.playSound(220, 0.1, 0, 0.15); });
            return _this;
        }
        PoseGame.prototype.reset = function () {
            var oldState = this.engine.currentState;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
            this.engine.resetObjects();
            this.player = new Player(this.engine.eventBus, this.assetRegistry, this.gameCanvas, this.keyboardControl);
            this.engine.addObject(this.player);
            this.engine.addObject(this);
            this.engine.switchState(oldState);
        };
        PoseGame.prototype.restart = function () {
            this.currentScore = 0;
            this.hasHighScore = undefined;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
        };
        PoseGame.prototype.init = function () {
            var _this = this;
            this.reset();
            // init intro state
            this.engine.switchState(PoseGame.INTRO_STATE);
            this.engine.addObject({
                update: function (deltaT) {
                    var currentControl = _this.keyboardControl.cursorControl();
                    if ('space' in currentControl)
                        _this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: function () {
                    _this.print({
                        text: "Hit Space to start.",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 100
                        }
                    });
                }
            });
            // init pause state
            this.engine.switchState(PoseGame.PAUSE_STATE);
            this.engine.addObject({
                update: function (deltaT) {
                    var currentControl = _this.keyboardControl.cursorControl();
                    if ('space' in currentControl)
                        _this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: function () {
                    _this.print({
                        text: "Pause-Mode. Continue using space key",
                        fontSize: 36,
                        position: {
                            x: 300,
                            y: 160
                        }
                    });
                }
            });
            // init game over state
            this.engine.switchState(PoseGame.GAME_OVER_STATE);
            this.engine.addObject({
                update: function (deltaT) {
                    if (typeof _this.hasHighScore === 'undefined')
                        _this.hasHighScore = _this.updateHighscore();
                    var currentControl = _this.keyboardControl.cursorControl();
                    if ('space' in currentControl) {
                        _this.restart();
                    }
                },
                render: function () {
                    _this.print({
                        text: _this.hasHighScore ? "Great, new high-score. Press Space for new game" : "Game Over. Press Space for new game",
                        fontSize: 36,
                        position: {
                            x: 300,
                            y: 160
                        }
                    });
                    _this.print({
                        text: "Your score: " + _this.currentScore,
                        fontSize: 36,
                        position: {
                            x: 350,
                            y: 260
                        }
                    });
                }
            });
            // begin with intro state
            this.engine.switchState(PoseGame.INTRO_STATE);
        };
        PoseGame.prototype.createFood = function (imageName, r, score, scale) {
            var _this = this;
            var food = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images[imageName],
                imageInfo: {
                    dh: r * scale.y, dw: r * scale.x
                },
                position: {
                    x: Math.round(Math.random() * (this.gameCanvas.canvas.width - 4 * r) + 2 * r),
                    y: Math.round(Math.random() * (this.gameCanvas.canvas.height - 4 * r) + 2 * r)
                },
                r: r
            });
            this.engine.addObject(food);
            this.physicsEngine.onCollision({
                object1: food,
                object2: this.player,
                callback: function () {
                    _this.playSoundGood();
                    _this.score(score);
                    _this.engine.removeObject(food);
                }
            });
        };
        PoseGame.prototype.createEnemy = function () {
            var _this = this;
            var r = PoseGame.ENEMY_RADIUS;
            var enemy = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images['enemy'],
                imageInfo: {
                    dh: r * 2, dw: r * 2
                },
                position: {
                    x: Math.round(Math.random() * (this.gameCanvas.canvas.width - 4 * r) + 2 * r),
                    y: Math.round(Math.random() * (this.gameCanvas.canvas.height - 4 * r) + 2 * r)
                },
                r: r
            });
            // do not add enemy if it might collide with player very soon
            var playerWithExtendedRadius = {
                position: {
                    x: this.player.position.x,
                    y: this.player.position.y
                },
                r: this.player.r * 5
            };
            if (!PhysicsEngine.circleCollidesWithCircle(enemy, playerWithExtendedRadius)) {
                this.engine.addObject(enemy);
                this.physicsEngine.onCollision({
                    object1: enemy,
                    object2: this.player,
                    callback: function () {
                        _this.playSoundBad();
                        _this.reset();
                        _this.engine.switchState(PoseGame.GAME_OVER_STATE);
                    }
                });
            }
        };
        PoseGame.prototype.render = function () {
            var text = "Score: " + this.currentScore + ", current highscore: " + this.currentHighscore();
            this.print({
                text: text,
                fontSize: 36,
                position: {
                    x: 25,
                    y: this.gameCanvas.canvas.height - 20
                }
            });
        };
        PoseGame.prototype.score = function (score) {
            this.currentScore += score;
            this.player.grow(score);
        };
        PoseGame.prototype.update = function () {
            if (Math.random() < PoseGame.likelinessFood1)
                this.createFood('food1', PoseGame.FOOD1_RADIUS, PoseGame.FOOD1_SCORE, {
                    x: 2, y: 2
                });
            if (Math.random() < PoseGame.likelinessFood3)
                this.createFood('food3', PoseGame.FOOD3_RADIUS, PoseGame.FOOD3_SCORE, {
                    x: 2, y: 2
                });
            if (Math.random() < PoseGame.likelinessFood2)
                this.createFood('food2', PoseGame.FOOD2_RADIUS, PoseGame.FOOD2_SCORE, {
                    x: 2, y: 2
                });
            if (Math.random() < PoseGame.enemyLikeliness)
                this.createEnemy();
            var currentControl = this.keyboardControl.cursorControl();
            if ('esc' in currentControl)
                this.engine.switchState(PoseGame.PAUSE_STATE);
        };
        PoseGame.FOOD1_RADIUS = 25;
        PoseGame.FOOD2_RADIUS = 20;
        PoseGame.FOOD3_RADIUS = 15;
        PoseGame.ENEMY_RADIUS = 20;
        PoseGame.FOOD1_SCORE = 2;
        PoseGame.FOOD2_SCORE = PoseGame.FOOD1_SCORE * 2;
        PoseGame.FOOD3_SCORE = PoseGame.FOOD1_SCORE * 5;
        PoseGame.likelinessFood3 = 0.002;
        PoseGame.likelinessFood2 = PoseGame.likelinessFood3 * 2;
        PoseGame.likelinessFood1 = PoseGame.likelinessFood2 * 3;
        PoseGame.enemyLikeliness = 0.002;
        PoseGame.INTRO_STATE = 'intro';
        PoseGame.MAIN_STATE = Engine.MAIN_STATE_NAME;
        PoseGame.GAME_OVER_STATE = 'game_over';
        PoseGame.PAUSE_STATE = 'pause';
        return PoseGame;
    }(Game));
    Pose.PoseGame = PoseGame;
})(Pose || (Pose = {}));
//# sourceMappingURL=pose.js.map