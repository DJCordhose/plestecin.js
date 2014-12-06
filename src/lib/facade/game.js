/// <reference path="../ext/waa.d.ts" />
/// <reference path="../core/plestecin.ts" />
/// <reference path="../modules/basicPhysics.ts" />
/// <reference path="../modules/gameCanvas.ts" />
/// <reference path="../modules/keyboardControl.ts" />
/// <reference path="../modules/assetRegistry.ts" />
var Plestecin;
(function (Plestecin) {
    var Game = (function () {
        function Game(gameName, canvasId) {
            this.gameName = gameName;
            this.currentScore = 0;
            this.engine = new Plestecin.Engine();
            this.gameCanvas = Plestecin.GameCanvas ? (canvasId ? new Plestecin.GameCanvas({ canvasId: canvasId }) : new Plestecin.GameCanvas()) : null;
            this.keyboardControl = Plestecin.KeyboardControl ? new Plestecin.KeyboardControl() : null;
            this.assetRegistry = Plestecin.AssetRegistry ? new Plestecin.AssetRegistry() : null;
            this.physicsEngine = Plestecin.PhysicsEngine ? new Plestecin.PhysicsEngine() : null;
            this.engine.registerPlugin(this.gameCanvas);
            this.engine.registerPlugin(this.keyboardControl);
            this.engine.registerPlugin(this.assetRegistry);
            this.engine.registerPlugin(this.physicsEngine);
            this.initAudioContext();
        }
        Game.prototype.start = function (init) {
            var _this = this;
            window.onload = function () { return _this.engine.start(init); };
        };
        Game.prototype.print = function (text) {
            this.gameCanvas.context.fillStyle = 'black';
            this.gameCanvas.context.font = text.fontSize + 'px sans-serif';
            this.gameCanvas.context.fillText(text.text, text.position.x, text.position.y);
        };
        Game.prototype.currentHighscore = function () {
            var highScoreKey = this.gameName + '-highscore';
            return localStorage.getItem(highScoreKey) || 0;
        };
        Game.prototype.setNewHighscore = function () {
            var highScoreKey = this.gameName + '-highscore';
            localStorage.setItem(highScoreKey, "" + this.currentScore);
        };
        Game.prototype.updateHighscore = function () {
            var highScore = this.currentHighscore();
            if (this.currentScore > highScore) {
                this.setNewHighscore();
                return true;
            }
            else {
                return false;
            }
        };
        // http://updates.html5rocks.com/2014/07/Web-Audio-Changes-in-m36
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
        Game.prototype.initAudioContext = function () {
            try {
                // Safari needs window prefix
                if (window.AudioContext || window.webkitAudioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
            }
            catch (e) {
                console.warn('Web Audio API is not supported in this browser');
                console.dir(e);
            }
        };
        Game.prototype.createOscillator = function (frequency, gain) {
            var oscillator = this.audioContext.createOscillator(); // Oscillator defaults to sine wave
            oscillator.type = oscillator.SQUARE;
            oscillator.frequency.value = frequency; // in hertz
            //    Create a gain node.
            var gainNode = this.audioContext.createGain();
            // Connect the source to the gain node.
            oscillator.connect(gainNode);
            // Connect the gain node to the destination.
            gainNode.connect(this.audioContext.destination);
            // Reduce the volume.
            gainNode.gain.value = gain || 0.1;
            return oscillator;
        };
        Game.prototype.playSound = function (frequency, duration, type, gain) {
            var oscillator = this.createOscillator(frequency, gain);
            if (typeof type != 'undefined') {
                oscillator.type = type;
            }
            oscillator.start(this.audioContext.currentTime); // play now
            oscillator.stop(this.audioContext.currentTime + duration); // seconds
        };
        Game.prototype.playSoundGood = function (frequency) {
            if (this.audioContext) {
                frequency = frequency || 440;
                var oscillator = this.createOscillator(frequency);
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.1); // seconds
            }
        };
        Game.prototype.playSoundBad = function (frequency) {
            if (this.audioContext) {
                frequency = frequency || 55;
                var oscillator = this.createOscillator(frequency);
                oscillator.type = "sawtooth";
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.5); // seconds
            }
        };
        return Game;
    })();
    Plestecin.Game = Game;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=game.js.map