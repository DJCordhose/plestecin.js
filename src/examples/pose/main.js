/// <reference path="../../lib/core/plestecin.ts" />
/// <reference path="../../lib/facade/game.ts" />
/// <reference path="../../lib/modules/basicPhysics.ts" />
/// <reference path="../../lib/modules/keyboardControl.ts" />
/// <reference path="pose.ts" />
var Pose;
(function (Pose) {
    var game = new Pose.PoseGame();
    game.start(function () {
        game.init();
    });
})(Pose || (Pose = {}));
//# sourceMappingURL=main.js.map