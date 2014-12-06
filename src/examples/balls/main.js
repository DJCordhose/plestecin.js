var Balls;
(function (Balls) {
    var game = new Balls.BallGame();
    game.start(function () {
        var player = new Balls.Player(game.engine.eventBus, game.gameCanvas, game.keyboardControl, {
            r: 10,
            color: 'blue',
            maxSpeed: 5,
            position: {
                x: 100,
                y: 100
            },
            gravity: 0.01,
            acceleration: 0.1,
            friction: 0
        });
        game.player = player;
        game.engine.addObject(game);
        game.engine.addObject(player);
    });
})(Balls || (Balls = {}));
//# sourceMappingURL=main.js.map