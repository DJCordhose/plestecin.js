/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/core/util.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/modules/assetRegistry.ts" />
/// <reference path="../../lib/modules/gameCanvas.ts" />
/// <reference path="../balls/balls.ts" />

module Wurfram {
    import mixin = Plestecin.Util.mixin;
    import MovingObjectConfig = Plestecin.MovingObjectConfig;
    import Sprite = Plestecin.Sprite;
    import Engine = Plestecin.Engine;
    import Game = Plestecin.Game;
    import PhysicsEngine = Plestecin.PhysicsEngine;

    export class Player extends Balls.Player implements Plestecin.SpriteConfig {
        imageInfo: Plestecin.ImageInfo;
        image: HTMLImageElement;
        initialWeight: number;
        initialGravity: number;

        constructor(eventBus: GameEventBus, assetRegistry: Plestecin.AssetRegistry, gameCanvas: Plestecin.GameCanvas, keyboadControl: Plestecin.KeyboardControl) {
            var config =
            {
                image: assetRegistry.images['wurfram'],
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
            super(eventBus, gameCanvas, keyboadControl, config);
            Plestecin.Sprite.call(this, this.gameCanvas, config);
            this.initialWeight = 80;
            this.initialGravity = this.gravity;
        }

        grow(amount: number) {
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
        }

        weightGain() {
            return ((this.gravity - this.initialGravity) * this.initialWeight * 1 / this.initialGravity).toFixed(2);
        }
    }
    mixin(Player, Plestecin.Sprite);

    export class WurframGame extends Game {

        static SAUSAGE_RADIUS = 20;
        static BURGER_RADIUS = 20;
        static PIZZA_RADIUS = 30;
        static ROSA_RADIUS = 20;

        static SAUSAGE_SCORE = 1;
        static PIZZA_SCORE = WurframGame.SAUSAGE_SCORE * 2;
        static BURGER_SCORE = WurframGame.SAUSAGE_SCORE * 5;

        static burgerLikeliness = 0.005;
        static pizzaLikeliness = WurframGame.burgerLikeliness * 2;
        static sausageLikeliness = WurframGame.pizzaLikeliness * 2;

        static rosaLikeliness = 0.001;

        static INTRO_STATE = 'intro';
        static MAIN_STATE = Engine.MAIN_STATE_NAME;
        static GAME_OVER_STATE = 'game_over';
        static PAUSE_STATE = 'pause';

        player: Player;
        private hasHighScore: boolean;

        constructor() {
            super("Wurfram");
            this.assetRegistry.loadImage('wurfram', 'images/wurfram.png');
            this.assetRegistry.loadImage('rosa', 'images/rosa.png');
            this.assetRegistry.loadImage('sausage', 'images/sausage2.png');
            this.assetRegistry.loadImage('burger', 'images/burger-tom.png');
            this.assetRegistry.loadImage('pizza', 'images/pizza-tom.png');

            this.engine.addState(Engine.initState(WurframGame.INTRO_STATE));
            this.engine.addState(Engine.initState(WurframGame.GAME_OVER_STATE));
            this.engine.addState(Engine.initState(WurframGame.PAUSE_STATE));

            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, () => this.playSound(220, 0.1, 0, 0.15));
        }

        reset() {
            this.currentScore = 0;
            this.hasHighScore = undefined;
            // init main state
            this.engine.switchState(Engine.MAIN_STATE_NAME);
            this.engine.resetObjects();
            this.player = new Player(this.engine.eventBus, this.assetRegistry, this.gameCanvas, this.keyboardControl);
            this.engine.addObject(this.player);
            this.engine.addObject(this);

        }

        init() {
            this.reset();

            // init intro state
            this.engine.switchState(WurframGame.INTRO_STATE);
            this.engine.addObject({
                update: (deltaT: number) => {
                    var currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: () => {
                    this.print({
                        text: "Wurfram is hungry. Steer him towards food using cursor keys.",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 100
                        }
                    });
                    this.print({
                        text: "Sausage score: 1, Pizza score: 2, Burger Score: 5",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 200
                        }
                    });
                    this.print({
                        text: "Beware of Wurfram's wife (the female mole), if she catches you, the game is over",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 300
                        }
                    });
                    this.print({
                            text: "Start game using space",
                            fontSize: 36,
                            position: {
                                x: 500,
                                y: 400
                            }
                        }
                    );
                    this.print({
                            text: "Programming by Olli",
                            fontSize: 36,
                            position: {
                                x: 400,
                                y: 500
                            }
                        }
                    );

                    this.print({
                            text: "Game graphics by Charlie, Olli, Jim and Tom Verweyen",
                            fontSize: 36,
                            position: {
                                x: 400,
                                y: 600
                            }
                        }
                    );
                }
            });

            // init pause state
            this.engine.switchState(WurframGame.PAUSE_STATE);
            this.engine.addObject({
                update: (deltaT: number) => {
                    var currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: () => {
                    this.print({
                            text: "Pause-Mode. Continue using space key",
                            fontSize: 36,
                            position: {
                                x: 300,
                                y: 160
                            }
                        }
                    );
                }
            });

            // init game over state
            this.engine.switchState(WurframGame.GAME_OVER_STATE);
            this.engine.addObject({
                update: (deltaT: number) => {
                    if (typeof this.hasHighScore === 'undefined') this.hasHighScore = this.updateHighscore();
                    var currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) {
                        this.reset();
                    }
                },
                render: () => {
                    this.print({
                            text: this.hasHighScore ? "Great, new high-score. Press Space for new game" : "Game Over. Press Space for new game",
                            fontSize: 36,
                            position: {
                                x: 300,
                                y: 160
                            }
                        }
                    );
                    this.print({
                            text: "Your score: " + this.currentScore,
                            fontSize: 36,
                            position: {
                                x: 350,
                                y: 260
                            }
                        }
                    );
                    this.print({
                            text: "Wurfram's gain in weight: " + this.player.weightGain() + " kg",
                            fontSize: 36,
                            position: {
                                x: 350,
                                y: 360
                            }
                        }
                    );
                }
            });

            // begin with intro state
            this.engine.switchState(WurframGame.INTRO_STATE);
        }

        createFood(imageName: string, r: number, score: number, scale: {
            x: number;
            y: number;
        }) {
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
                callback: () => {
                    this.playSoundGood();
                    this.score(score);
                    this.engine.removeObject(food);
                }
            });
        }

        createRosa() {
            var r = WurframGame.ROSA_RADIUS;
            var rosa = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images['rosa'],
                imageInfo: {
                    dh: r * 2, dw: r * 3
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
                    callback: () => {
                        this.playSoundBad();
                        this.engine.switchState(WurframGame.GAME_OVER_STATE);
                    }
                });
            }
        }

        render() {
            var text = "Score: " + this.currentScore + ", current highscore: " + this.currentHighscore();
            this.print({
                text: text,
                fontSize: 18,
                position: {
                    x: 25,
                    y: this.gameCanvas.canvas.height - 20
                }

            })
        }

        score(score: number) {
            this.currentScore += score;
            this.player.grow(score);
        }

        update() {
            if (Math.random() < WurframGame.sausageLikeliness)
                this.createFood('sausage', WurframGame.SAUSAGE_RADIUS, WurframGame.SAUSAGE_SCORE, {
                    x: 3, y: 2
                });
            if (Math.random() < WurframGame.burgerLikeliness)
            this.createFood('burger', WurframGame.BURGER_RADIUS, WurframGame.BURGER_SCORE, {
                x: 3, y: 2
            });
            if (Math.random() < WurframGame.pizzaLikeliness)
            this.createFood('pizza', WurframGame.PIZZA_RADIUS, WurframGame.PIZZA_SCORE, {
                x: 2, y: 2
            });
            if (Math.random() < WurframGame.rosaLikeliness) this.createRosa();
            var currentControl = this.keyboardControl.cursorControl();
            if ('esc' in currentControl) this.engine.switchState(WurframGame.PAUSE_STATE);
        }
    }
}
