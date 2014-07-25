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
    import BallConfig = Plestecin.PhysicalObjectConfig;
    import MovingObjectConfig = Plestecin.MovingObjectConfig;

    export class Player extends Balls.Player implements Plestecin.Sprite {
        constructor(assetRegistry: Plestecin.AssetRegistry, gameCanvas: Plestecin.GameCanvas, keyboadControl: Plestecin.KeyboardControl) {
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
            super(gameCanvas, keyboadControl, config);
            this.init(config);
        }

        init(config: MovingObjectConfig) {
            Plestecin.Sprite.call(this, this.gameCanvas, config);
            super.init(config);
        }

    }
    mixin(Player, Plestecin.Sprite);

    export class WurframGame extends Balls.BallGame {

        constructor() {
            super();
            this.assetRegistry.loadImage('wurfram', 'images/wurfram.png');

            this.gameName = "Wurfram";
            this.description = 'Wurfram! Hit green balls and avoid red ones and your own tail. Control Wurfram relative to current direction by using left and right cursor keys.'
            this.greenBallLikeliness = 0.01;
            this.redBallLikeliness = 0.001;

            this.engine.eventBus.on(Plestecin.MovingObject.BOUNCE_EVENT, () => this.playSound(220, 0.1, 0, 0.15));
        }

    }
}
