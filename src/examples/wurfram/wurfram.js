/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/core/util.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/modules/assetRegistry.ts" />
/// <reference path="../../lib/modules/gameCanvas.ts" />
/// <reference path="../balls/balls.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Wurfram;
(function (Wurfram) {
    var mixin = Plestecin.Util.mixin;
    var Sprite = Plestecin.Sprite;
    var Engine = Plestecin.Engine;
    var Game = Plestecin.Game;
    var PhysicsEngine = Plestecin.PhysicsEngine;
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(eventBus, assetRegistry, gameCanvas, keyboadControl) {
            var config = {
                image: assetRegistry.images['wurfram'],
                imageInfo: {
                    dh: 60,
                    dw: 60
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
            _super.call(this, eventBus, gameCanvas, keyboadControl, config);
            Plestecin.Sprite.call(this, this.gameCanvas, config);
            this.initialWeight = 80;
            this.initialGravity = this.gravity;
        }
        Player.prototype.grow = function (amount) {
            //            var addedsize = amount / 20;
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
    })(Balls.Player);
    Wurfram.Player = Player;
    mixin(Player, Plestecin.Sprite);
    var WurframGame = (function (_super) {
        __extends(WurframGame, _super);
        function WurframGame() {
            var _this = this;
            _super.call(this, "Wurfram");
            this.assetRegistry.loadImage('wurfram', 'images/wurfram.png');
            this.assetRegistry.loadImage('rosa', 'images/rosa.png');
            this.assetRegistry.loadImage('sausage', 'images/sausage2.png');
            this.assetRegistry.loadImage('burger', 'images/burger-tom.png');
            this.assetRegistry.loadImage('pizza', 'images/pizza-tom.png');
            this.engine.addState(Engine.initState(WurframGame.INTRO_STATE));
            this.engine.addState(Engine.initState(WurframGame.GAME_OVER_STATE));
            this.engine.addState(Engine.initState(WurframGame.PAUSE_STATE));
            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, function () { return _this.playSound(220, 0.1, 0, 0.15); });
        }
        WurframGame.prototype.reset = function () {
            var oldState = this.engine.currentState;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
            this.engine.resetObjects();
            this.player = new Player(this.engine.eventBus, this.assetRegistry, this.gameCanvas, this.keyboardControl);
            this.engine.addObject(this.player);
            this.engine.addObject(this);
            this.engine.switchState(oldState);
        };
        WurframGame.prototype.restart = function () {
            this.currentScore = 0;
            this.hasHighScore = undefined;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
        };
        WurframGame.prototype.init = function () {
            var _this = this;
            this.reset();
            // init intro state
            this.engine.switchState(WurframGame.INTRO_STATE);
            this.engine.addObject({
                update: function (deltaT) {
                    var currentControl = _this.keyboardControl.cursorControl();
                    if ('space' in currentControl)
                        _this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: function () {
                    _this.print({
                        text: "Wurfram is hungry. Steer him towards food using cursor keys.",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 100
                        }
                    });
                    _this.print({
                        text: "Sausage score: 1, Pizza score: 2, Burger Score: 5",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 200
                        }
                    });
                    _this.print({
                        text: "Beware of Wurfram's wife (the female mole), if she catches you, the game is over",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 300
                        }
                    });
                    _this.print({
                        text: "The more you eat, the fatter Wurfram gets, the harder he will be to control",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 400
                        }
                    });
                    _this.print({
                        text: "Start game using space",
                        fontSize: 36,
                        position: {
                            x: 500,
                            y: 500
                        }
                    });
                    _this.print({
                        text: "Programming by Olli",
                        fontSize: 36,
                        position: {
                            x: 500,
                            y: 600
                        }
                    });
                    _this.print({
                        text: "Game design and graphics by Charlie, Olli, Jim and Tom Verweyen",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 700
                        }
                    });
                }
            });
            // init pause state
            this.engine.switchState(WurframGame.PAUSE_STATE);
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
            this.engine.switchState(WurframGame.GAME_OVER_STATE);
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
                    // TODO: seems like player is reset before we display this, as waight gain is always 0 and gravity is reset to initial
                    /*
                    this.print({
                            text: "Wurfram's gain in weight: " + this.player.weightGain() + " kg",
                            fontSize: 36,
                            position: {
                                x: 350,
                                y: 360
                            }
                        }
                    );
                    */
                }
            });
            // begin with intro state
            this.engine.switchState(WurframGame.INTRO_STATE);
        };
        WurframGame.prototype.createFood = function (imageName, r, score, scale) {
            var _this = this;
            var food = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images[imageName],
                imageInfo: {
                    dh: r * scale.y,
                    dw: r * scale.x
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
        WurframGame.prototype.createRosa = function () {
            var _this = this;
            var r = WurframGame.ROSA_RADIUS;
            var rosa = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images['rosa'],
                imageInfo: {
                    dh: r * 2,
                    dw: r * 3
                },
                position: {
                    x: Math.round(Math.random() * (this.gameCanvas.canvas.width - 4 * r) + 2 * r),
                    y: Math.round(Math.random() * (this.gameCanvas.canvas.height - 4 * r) + 2 * r)
                },
                r: r
            });
            // do not add rosa if she might collide with wurfram very soon
            var playerWithExtendedRadius = {
                position: {
                    x: this.player.position.x,
                    y: this.player.position.y
                },
                r: this.player.r * 5
            };
            if (!PhysicsEngine.circleCollidesWithCircle(rosa, playerWithExtendedRadius)) {
                this.engine.addObject(rosa);
                this.physicsEngine.onCollision({
                    object1: rosa,
                    object2: this.player,
                    callback: function () {
                        _this.playSoundBad();
                        _this.reset();
                        _this.engine.switchState(WurframGame.GAME_OVER_STATE);
                    }
                });
            }
        };
        WurframGame.prototype.render = function () {
            var text = "Score: " + this.currentScore + ", current highscore: " + this.currentHighscore();
            this.print({
                text: text,
                fontSize: 18,
                position: {
                    x: 25,
                    y: this.gameCanvas.canvas.height - 20
                }
            });
        };
        WurframGame.prototype.score = function (score) {
            this.currentScore += score;
            this.player.grow(score);
        };
        WurframGame.prototype.update = function () {
            if (Math.random() < WurframGame.sausageLikeliness)
                this.createFood('sausage', WurframGame.SAUSAGE_RADIUS, WurframGame.SAUSAGE_SCORE, {
                    x: 3,
                    y: 2
                });
            if (Math.random() < WurframGame.burgerLikeliness)
                this.createFood('burger', WurframGame.BURGER_RADIUS, WurframGame.BURGER_SCORE, {
                    x: 3,
                    y: 2
                });
            if (Math.random() < WurframGame.pizzaLikeliness)
                this.createFood('pizza', WurframGame.PIZZA_RADIUS, WurframGame.PIZZA_SCORE, {
                    x: 2,
                    y: 2
                });
            if (Math.random() < WurframGame.rosaLikeliness)
                this.createRosa();
            var currentControl = this.keyboardControl.cursorControl();
            if ('esc' in currentControl)
                this.engine.switchState(WurframGame.PAUSE_STATE);
        };
        WurframGame.SAUSAGE_RADIUS = 20;
        WurframGame.BURGER_RADIUS = 20;
        WurframGame.PIZZA_RADIUS = 30;
        WurframGame.ROSA_RADIUS = 20;
        WurframGame.SAUSAGE_SCORE = 1;
        WurframGame.PIZZA_SCORE = WurframGame.SAUSAGE_SCORE * 2;
        WurframGame.BURGER_SCORE = WurframGame.SAUSAGE_SCORE * 5;
        WurframGame.burgerLikeliness = 0.005;
        WurframGame.pizzaLikeliness = WurframGame.burgerLikeliness * 2;
        WurframGame.sausageLikeliness = WurframGame.pizzaLikeliness * 2;
        WurframGame.rosaLikeliness = 0.001;
        WurframGame.INTRO_STATE = 'intro';
        WurframGame.MAIN_STATE = Engine.MAIN_STATE_NAME;
        WurframGame.GAME_OVER_STATE = 'game_over';
        WurframGame.PAUSE_STATE = 'pause';
        return WurframGame;
    })(Game);
    Wurfram.WurframGame = WurframGame;
})(Wurfram || (Wurfram = {}));
//# sourceMappingURL=wurfram.js.map