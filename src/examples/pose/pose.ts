/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/core/util.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/modules/assetRegistry.ts" />
/// <reference path="../../lib/modules/gameCanvas.ts" />
/// <reference path="../balls/balls.ts" />

module Pose {
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
            const config =
            {
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
            super(eventBus, gameCanvas, keyboadControl, config);
            Plestecin.Sprite.call(this, this.gameCanvas, config);
            this.initialWeight = 80;
            this.initialGravity = this.gravity;
        }

        grow(amount: number) {
            //            const addedsize = amount / 20;
            const addedsize = amount / 10;
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

    export class PoseGame extends Game {

        static FOOD1_RADIUS = 25;
        static FOOD2_RADIUS = 20;
        static FOOD3_RADIUS = 15;
        static ENEMY_RADIUS = 20;

        static FOOD1_SCORE = 1;
        static FOOD2_SCORE = PoseGame.FOOD1_SCORE * 2;
        static FOOD3_SCORE = PoseGame.FOOD1_SCORE * 5;

        static likelinessFood3 = 0.001;
        static likelinessFood2 = PoseGame.likelinessFood3 * 2;
        static likelinessFood1 = PoseGame.likelinessFood2 * 2;

        static enemyLikeliness = 0.001;

        static INTRO_STATE = 'intro';
        static MAIN_STATE = Engine.MAIN_STATE_NAME;
        static GAME_OVER_STATE = 'game_over';
        static PAUSE_STATE = 'pause';

        player: Player;
        private hasHighScore: boolean;

        constructor() {
            super("Pose", "field");
            this.assetRegistry.loadImage('player', 'images/wurfram.png');
            this.assetRegistry.loadImage('enemy', 'images/apple.png');
            this.assetRegistry.loadImage('food1', 'images/beer-gold.png');
            this.assetRegistry.loadImage('food2', 'images/wurst.png');
            this.assetRegistry.loadImage('food3', 'images/pizza.png');

            this.engine.addState(Engine.initState(PoseGame.INTRO_STATE));
            this.engine.addState(Engine.initState(PoseGame.GAME_OVER_STATE));
            this.engine.addState(Engine.initState(PoseGame.PAUSE_STATE));

            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, () => this.playSound(220, 0.1, 0, 0.15));
        }

        reset() {
            const oldState = this.engine.currentState;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
            this.engine.resetObjects();
            this.player = new Player(this.engine.eventBus, this.assetRegistry, this.gameCanvas, this.keyboardControl);
            this.engine.addObject(this.player);
            this.engine.addObject(this);
            this.engine.switchState(oldState);
        }

        restart() {
            this.currentScore = 0;
            this.hasHighScore = undefined;
            this.engine.switchState(Engine.MAIN_STATE_NAME);
        }

        init() {
            this.reset();

            // init intro state
            this.engine.switchState(PoseGame.INTRO_STATE);
            this.engine.addObject({
                update: (deltaT: number) => {
                    const currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) this.engine.switchState(Engine.MAIN_STATE_NAME);
                },
                render: () => {
                    this.print({
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
                update: (deltaT: number) => {
                    const currentControl = this.keyboardControl.cursorControl();
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
            this.engine.switchState(PoseGame.GAME_OVER_STATE);
            this.engine.addObject({
                update: (deltaT: number) => {
                    if (typeof this.hasHighScore === 'undefined') this.hasHighScore = this.updateHighscore();
                    const currentControl = this.keyboardControl.cursorControl();
                    if ('space' in currentControl) {
                        this.restart();
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
                }
            });

            // begin with intro state
            this.engine.switchState(PoseGame.INTRO_STATE);
        }

        createFood(imageName: string, r: number, score: number, scale: {
            x: number;
            y: number;
        }) {
            const food = new Sprite(this.gameCanvas, {
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

        createEnemy() {
            const r = PoseGame.ENEMY_RADIUS;
            const enemy = new Sprite(this.gameCanvas, {
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
            const playerWithExtendedRadius = {
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
                    callback: () => {
                        this.playSoundBad();
                        this.reset();
                        this.engine.switchState(PoseGame.GAME_OVER_STATE);
                    }
                });
            }
        }

        render() {
            const text = "Score: " + this.currentScore + ", current highscore: " + this.currentHighscore();
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
            if (Math.random() < PoseGame.enemyLikeliness) this.createEnemy();
            const currentControl = this.keyboardControl.cursorControl();
            if ('esc' in currentControl) this.engine.switchState(PoseGame.PAUSE_STATE);
        }
    }
}
