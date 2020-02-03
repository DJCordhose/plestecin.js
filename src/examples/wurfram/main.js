/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="wurfram.ts" />
var Wurfram;
(function (Wurfram) {
    var game = new Wurfram.WurframGame();
    game.start(function () {
        game.init();
    });
})(Wurfram || (Wurfram = {}));
//# sourceMappingURL=main.js.map