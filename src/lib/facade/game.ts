/// <reference path="../ext/waa.d.ts" />
/// <reference path="../core/plestecin.ts" />
/// <reference path="../modules/basicPhysics.ts" />
/// <reference path="../modules/gameCanvas.ts" />
/// <reference path="../modules/keyboardControl.ts" />
/// <reference path="../modules/assetRegistry.ts" />

// Needed to access audiocontext via window - required by Safari (https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
interface Window {
    AudioContext: new () => AudioContext
    webkitAudioContext: new () => AudioContext
}

module Plestecin {
    export class Game implements GameObject {
        engine: Engine;
        currentScore: number = 0;
        private gameOver: boolean = false;
        private running: boolean = true;
        gameCanvas: GameCanvas;
        keyboardControl: KeyboardControl;
        assetRegistry: AssetRegistry;
        physicsEngine: PhysicsEngine;

        audioContext;

        constructor(public gameName: string, public description: string, canvasId?: string) {
            this.engine = new Engine();
            this.init(canvasId);
        }

        init(canvasId?: string) {
            this.gameCanvas = GameCanvas ? (canvasId ? new GameCanvas({canvasId: canvasId}) : new GameCanvas()) : null;
            this.keyboardControl = KeyboardControl ? new KeyboardControl() : null;
            this.assetRegistry = AssetRegistry ? new AssetRegistry() : null;
            this.physicsEngine = PhysicsEngine ? new PhysicsEngine() : null;
            this.engine.registerPlugin(this.gameCanvas);
            this.engine.registerPlugin(this.keyboardControl);
            this.engine.registerPlugin(this.assetRegistry);
            this.engine.registerPlugin(this.physicsEngine);
            this.initAudioContext();
        }

        render() {
            var highScoreKey = this.gameName + '-highscore';
            var highScore = localStorage.getItem(highScoreKey) || 0;
            var text;
            if (this.gameOver) {
                if (this.currentScore > highScore) {
                    text = 'Game over, NEW HIGHTSCORE: ' + this.currentScore;
                    localStorage.setItem(highScoreKey, "" + this.currentScore);
                } else {
                    text = 'Game over, final score: ' + this.currentScore;
                }
            } else {
                text = "Score: " + this.currentScore;
            }
            this.gameCanvas.context.fillStyle = 'black';
            this.gameCanvas.context.font = '12px sans-serif';
            this.gameCanvas.context.fillText(text, 20, this.gameCanvas.canvas.height - 20);
            this.gameCanvas.context.fillText(this.description + ' Hit ESC to pause. Reload page to try again. Current high score: ' + highScore, 20, 20);
            if (!this.running && !this.gameOver) {
                this.gameCanvas.context.fillText('Paused, hit ESC to resume', 100, 100);
            }
        }

        suspend() {
            this.running = false;
        }

        resume() {
            this.running = true;
        }

        loose() {
            this.playSoundBad();
            this.gameOver = true;
            this.engine.stop();
        }

        start(init: () => void) {
            window.onload = () => this.engine.start(init);
        }

        // http://updates.html5rocks.com/2014/07/Web-Audio-Changes-in-m36
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
        private initAudioContext() {
            try {
                // Safari needs window prefix
                if (window.AudioContext || window.webkitAudioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
                }
            } catch (e) {
                console.warn('Web Audio API is not supported in this browser');
                console.dir(e);
            }
        }

        createOscillator(frequency: number, gain?: number) {
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
        }

        playSound(frequency, duration, type, gain) {
            var oscillator = this.createOscillator(frequency, gain);
            if (typeof type != 'undefined') {
                oscillator.type = type;
            }
            oscillator.start(this.audioContext.currentTime); // play now
            oscillator.stop(this.audioContext.currentTime + duration); // seconds
        }

        playSoundGood(frequency?: number) {
            if (this.audioContext) {
                frequency = frequency || 440;
                var oscillator = this.createOscillator(frequency);
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.1); // seconds
            }
        }

        playSoundBad(frequency?: number) {
            if (this.audioContext) {
                frequency = frequency || 55;
                var oscillator = this.createOscillator(frequency);
                oscillator.type = "sawtooth";
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.5); // seconds
            }
        }
    }
}