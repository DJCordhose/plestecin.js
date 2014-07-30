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

    export class Player extends Balls.Player {
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
        }
    }
    mixin(Player, Plestecin.Sprite);

    export class WurframGame extends Game {

        static sausageLikeliness = 0.1;
        static SAUSAGE_RADIUS = 20;
        static ROSA_RADIUS = 20;

        static burgerLikeliness = 0.1;
        static rosaLikeliness = 0.01;
        static INTRO_STATE = 'intro';
        static MAIN_STATE = Engine.MAIN_STATE_NAME;
        static GAME_OVER_STATE = 'game_over';
        static PAUSE_STATE = 'pause';

        player: Player;

        constructor() {
            super("Wurfram");
            this.assetRegistry.loadImage('wurfram', 'images/wurfram.png');
            this.assetRegistry.loadImage('rosa', 'images/rosa.png');
            this.assetRegistry.loadImage('sausage', 'images/sausage2.png');
            this.assetRegistry.loadImage('burger', 'images/sausage.png');

            this.engine.addState(Engine.initState(WurframGame.INTRO_STATE));
            this.engine.addState(Engine.initState(WurframGame.GAME_OVER_STATE));
            this.engine.addState(Engine.initState(WurframGame.PAUSE_STATE));

            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, () => this.playSound(220, 0.1, 0, 0.15));
        }

        reset() {
            this.currentScore = 0;
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
                        text: "Wurfram ist hungrig. Steuere Wurfram mit den Pfeil-Tasten zu dem Essen!",
                        fontSize: 36,
                        position: {
                            x: 100,
                            y: 100
                        }
                    });
                    this.print({
                            text: "Beginne das Spiel mit der Leertaste",
                            fontSize: 36,
                            position: {
                                x: 300,
                                y: 160
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
                            text: "Spiel im Pause-Modus. Fortsetzen mit der Leertaste",
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
                    this.updateHighscore();
                    var currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) {
                        this.reset();
                    }
                },
                render: () => {
                    this.print({
                            // FIXME: Check does not work
                            text: (this.currentScore === this.currentHighscore()) ? "Great, new high-score. Press Space for new game" : "Game Over. Press Space for new game",
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
                }
            });

            // begin with intro state
            this.engine.switchState(WurframGame.INTRO_STATE);
        }

        createSausage() {
            var r = WurframGame.SAUSAGE_RADIUS;
            var sausage = new Sprite(this.gameCanvas, {
                image: this.assetRegistry.images['sausage'],
                imageInfo: {
                    dh: r * 2, dw: r * 3
                },
                position: {
                    x: Math.round(Math.random() * (this.gameCanvas.canvas.width - 4 * r) + 2 * r),
                    y: Math.round(Math.random() * (this.gameCanvas.canvas.height - 4 * r) + 2 * r)
                },
                r: r
            });
            this.engine.addObject(sausage);
            this.physicsEngine.onCollision({
                object1: sausage,
                object2: this.player,
                callback: () => {
                    this.playSoundGood();
                    this.currentScore++;
                    this.engine.removeObject(sausage);
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

        update() {
            if (Math.random() < WurframGame.sausageLikeliness) this.createSausage();
//            if (Math.random() < WurframGame.burgerLikeliness) this.createBurger();
            if (Math.random() < WurframGame.rosaLikeliness) this.createRosa();
            var currentControl = this.keyboardControl.cursorControl();
            if ('esc' in currentControl) this.engine.switchState(WurframGame.PAUSE_STATE);

        }


    }
}
