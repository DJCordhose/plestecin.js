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

    export class WurframGame extends Balls.BallGame {

        static sausageLikeliness = 0.1;
        static SAUSAGE_RADUIS = 20;

        static burgerLikeliness = 0.1;
        static rosaLikeliness = 0.01;

        constructor() {
            super();
            this.assetRegistry.loadImage('wurfram', 'images/wurfram.png');
            this.assetRegistry.loadImage('rosa', 'images/sausage.png');
            this.assetRegistry.loadImage('sausage', 'images/sausage2.png');
            this.assetRegistry.loadImage('burger', 'images/sausage.png');

            this.gameName = "Wurfram";
            this.description = 'Wurfram! Hit green balls and avoid red ones and your own tail. Control Wurfram relative to current direction by using left and right cursor keys.'
            this.greenBallLikeliness = 0.01;
            this.redBallLikeliness = 0.001;

            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, () => this.playSound(220, 0.1, 0, 0.15));
        }

        createSausage() {
            var r = WurframGame.SAUSAGE_RADUIS;
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

        update() {
            if (Math.random() < WurframGame.sausageLikeliness) this.createSausage();
//            if (Math.random() < this.burgerLikeliness) this.createBurger();
//            if (Math.random() < this.rosaLikeliness) this.createRosa();
        }


    }
}
