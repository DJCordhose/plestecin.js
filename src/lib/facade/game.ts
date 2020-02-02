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
    export interface GameText {
        text: string;
        position: {
            x: number;
            y: number;
        };
        fontSize: number;
    }

    export class Game /* implements GameObject */ {
        engine: Engine;
        currentScore: number = 0;
        gameCanvas: GameCanvas;
        keyboardControl: KeyboardControl;
        assetRegistry: AssetRegistry;
        physicsEngine: PhysicsEngine;

        audioContext;

        constructor(public gameName: string, canvasId?: string) {
            this.engine = new Engine();
            this.gameCanvas = GameCanvas ? (canvasId ? new GameCanvas({canvasId: canvasId, width: 1000, height: 800}) : new GameCanvas()) : null;
            this.keyboardControl = KeyboardControl ? new KeyboardControl() : null;
            this.assetRegistry = AssetRegistry ? new AssetRegistry() : null;
            this.physicsEngine = PhysicsEngine ? new PhysicsEngine() : null;
            this.engine.registerPlugin(this.gameCanvas);
            this.engine.registerPlugin(this.keyboardControl);
            this.engine.registerPlugin(this.assetRegistry);
            this.engine.registerPlugin(this.physicsEngine);
            this.initAudioContext();
        }

        start(init: () => void) {
            window.onload = () => this.engine.start(init);
        }

        print(text: GameText) {
            this.gameCanvas.context.fillStyle = 'black';
            this.gameCanvas.context.font = text.fontSize + 'px sans-serif';
            this.gameCanvas.context.fillText(text.text, text.position.x, text.position.y);
        }

        currentHighscore() {
            const highScoreKey = this.gameName + '-highscore';
            return localStorage.getItem(highScoreKey) || 0;
        }

        setNewHighscore() {
            const highScoreKey = this.gameName + '-highscore';
            localStorage.setItem(highScoreKey, "" + this.currentScore);
        }

        updateHighscore() {
            const highScore = this.currentHighscore();
            if (this.currentScore > highScore) {
                this.setNewHighscore();
                return true;
            } else {
                return false;
            }
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
            const oscillator = this.audioContext.createOscillator(); // Oscillator defaults to sine wave
            oscillator.type = oscillator.SQUARE;
            oscillator.frequency.value = frequency; // in hertz

            //    Create a gain node.
            const gainNode = this.audioContext.createGain();
            // Connect the source to the gain node.
            oscillator.connect(gainNode);
            // Connect the gain node to the destination.
            gainNode.connect(this.audioContext.destination);
            // Reduce the volume.
            gainNode.gain.value = gain || 0.1;

            return oscillator;
        }

        playSound(frequency, duration, type, gain) {
            const oscillator = this.createOscillator(frequency, gain);
            if (typeof type != 'undefined') {
                oscillator.type = type;
            }
            oscillator.start(this.audioContext.currentTime); // play now
            oscillator.stop(this.audioContext.currentTime + duration); // seconds
        }

        playSoundGood(frequency?: number) {
            if (this.audioContext) {
                frequency = frequency || 440;
                const oscillator = this.createOscillator(frequency);
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.1); // seconds
            }
        }

        playSoundBad(frequency?: number) {
            if (this.audioContext) {
                frequency = frequency || 55;
                const oscillator = this.createOscillator(frequency);
                oscillator.type = "sawtooth";
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.5); // seconds
            }
        }
    }
}