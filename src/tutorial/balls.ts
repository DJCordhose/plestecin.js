/// <reference path="../lib/core/plestecin.ts" />
/// <reference path="../lib/modules/simpleGameBase.ts" />
/// <reference path="../lib/modules/basicPhysics.ts" />
/// <reference path="../lib/modules/keyboardControl.ts" />

import Engine = Plestecin.Engine;
import mixin = Plestecin.Util.mixin;
import GameObject = Plestecin.GameObject;
import SimpleGameBase = Plestecin.SimpleGameBase;
import MovingObject = Plestecin.MovingObject;
import Ball = Plestecin.Ball;
import GameCanvas = Plestecin.GameCanvas;
import BallConfig = Plestecin.BallConfig;
import KeyboardControl = Plestecin.KeyboardControl;

class Player extends MovingObject implements GameObject, Ball {
    color: string;
    render: () => void;

    constructor(gameCanvas: GameCanvas, private keyboadControl: KeyboardControl, config: BallConfig) {
        super(gameCanvas, config);
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

class Logic extends SimpleGameBase {

    private greenBallLikeliness = 0.1;
    private redBallLikeliness = 0.01;
    player: Player;

    private static ballRadius = 10;

    constructor(engine: Engine) {
        super(engine, 'balls', 'Hit green balls and avoid red ones. Accelerate by using cursor keys.');
    }

    private createBall(color: string): Ball {
        var r = Logic.ballRadius;
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
        ball.update = () => {
            if (ball.collidesWith(this.player)) {
                this.playSoundGood();
                this.currentScore++;
                this.engine.removeObject(ball);
            }
        };
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
        if (ball.collidesWith(playerWithExtendedRadius)) {
            this.engine.removeObject(ball);
        }

        ball.update = () => {
            if (ball.collidesWith(this.player)) {
                this.loose();
            }
        };
    }

    update() {
        if (Math.random() < this.greenBallLikeliness) this.createGreenBall();
        if (Math.random() < this.redBallLikeliness) this.createRedBall();
    }
}
var engine = new Engine();
var logic = new Logic(engine);
var player = new Player(logic.gameCanvas, logic.keyboardControl, {
    r: 10,
    color: 'blue',
    maxSpeed: 5,
    position: {
        x: 100,
        y: 100
    },
    gravity: 0.01,
    acceleration: 0.1,
    friction: 0});
logic.player = player;
engine.addObject(logic);
engine.addObject(player);

window.onload = () => {
    engine.start();
};
