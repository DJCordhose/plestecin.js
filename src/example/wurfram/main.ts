/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="wurfram.ts" />

module Wurfram {
    var game = new WurframGame();

    game.start(() => {
        var player = new Player(game.engine.eventBus, game.assetRegistry, game.gameCanvas, game.keyboardControl);
        game.init(player);
    });
}