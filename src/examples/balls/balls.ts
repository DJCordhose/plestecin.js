/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="../../lib/facade/game.ts" />

module Balls {
    import Engine = Plestecin.Engine;
    import mixin = Plestecin.Util.mixin;
    import GameObject = Plestecin.GameObject;
    import Game = Plestecin.Game;
    import MovingObject = Plestecin.MovingObject;
    import Ball = Plestecin.Ball;
    import GameCanvas = Plestecin.GameCanvas;
    import BallConfig = Plestecin.BallConfig;
    import KeyboardControl = Plestecin.KeyboardControl;
    import PhysicsEngine = Plestecin.PhysicsEngine;

    export class Player extends MovingObject implements GameObject {
        color: string;

        constructor(eventBus: GameEventBus, gameCanvas: GameCanvas, private keyboadControl: KeyboardControl, config: BallConfig) {
            super(eventBus, gameCanvas, config);
            this.color = config.color;
        }

        accelerate(deltaT) {
            var currentControl = this.keyboadControl.cursorControl();
            if ('up' in currentControl) this.velocity.y -= this.acceleration * deltaT;
            if ('down' in currentControl) this.velocity.y += this.acceleration * deltaT;
            if ('left' in currentControl) this.velocity.x -= this.acceleration * deltaT;
            if ('right' in currentControl) this.velocity.x += this.acceleration * deltaT;
        }

        update(deltaT: number) {
            this.accelerate(deltaT);
            this.inertiaMove(deltaT);
        }
    }

    mixin(Player, Ball);

    export class BallGame extends Game {

        greenBallLikeliness = 0.1;
        redBallLikeliness = 0.01;
        player: Player;

        private static ballRadius = 10;

        constructor() {
            super('balls', 'Hit green balls and avoid red ones. Accelerate by using cursor keys.');
        }

        private createBall(color: string): Ball {
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
        }

        private createGreenBall() {
            var ball = this.createBall('green');
            this.physicsEngine.onCollision({
                object1: ball,
                object2: this.player,
                callback: () => {
                    this.playSoundGood();
                    this.currentScore++;
                    this.engine.removeObject(ball);
                }
            });
        }

        private createRedBall() {
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
            } else {
                this.physicsEngine.onCollision({
                    object1: ball,
                    object2: this.player,
                    callback: () => {
                        this.loose();
                    }
                });

            }
        }

        update() {
            if (Math.random() < this.greenBallLikeliness) this.createGreenBall();
            if (Math.random() < this.redBallLikeliness) this.createRedBall();
        }
    }
}