/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="balls.ts" />

module Balls {
    var game = new BallGame();
    game.start(() => {
        var player = new Player(game.gameCanvas, game.keyboardControl, {
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
        game.player = player;
        game.engine.addObject(game);
        game.engine.addObject(player);
    });
}