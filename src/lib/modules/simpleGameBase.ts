/// <reference path="../ext/waa.d.ts" />
/// <reference path="../core/plestecin.ts" />
/// <reference path="gameCanvas.ts" />
/// <reference path="basicPhysics.ts" />
/// <reference path="keyboardControl.ts" />

module Plestecin {
    export interface BallConfig extends MovingObjectConfig {
        color: string;
    }

    export class Ball extends PhysicalObject implements GameObject {
        color: string;
        update: (deltaT: number) => void;

        constructor(public gameCanvas: GameCanvas, config: BallConfig) {
            super(config);
            this.color = config.color;
        }

        render() {
            this.gameCanvas.context.fillStyle = this.color;
            this.gameCanvas.context.beginPath();
            this.gameCanvas.context.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
            this.gameCanvas.context.fill();
            this.gameCanvas.context.closePath();
        }

    }

    export class SimpleGameBase implements GameObject {
        currentScore:number = 0;
        private gameOver:boolean = false;
        private running:boolean = true;
        gameCanvas: GameCanvas;
        keyboardControl: KeyboardControl;

        audioContext;

        constructor(public engine: Engine, private gameName:string, private description:string, canvasId?: string) {
            this.gameCanvas = canvasId ? new GameCanvas({canvasId: canvasId}) : new GameCanvas();
            this.keyboardControl = new KeyboardControl();
            this.engine.registerPlugin(this.gameCanvas);
            this.engine.registerPlugin(this.keyboardControl);
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

        private initAudioContext() {
            try {
                if (webkitAudioContext || AudioContext) {
                    this.audioContext = new (webkitAudioContext || AudioContext)();
                }
            }
            catch (e) {
                console.warn('Web Audio API is not supported in this browser');
                console.dir(e);
            }
        }

        createOscillator(frequency:number) {
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
            gainNode.gain.value = 0.1;

            return oscillator;
        }

        playSoundGood(frequency?:number) {
            if (this.audioContext) {
                frequency = frequency || 440;
                var oscillator = this.createOscillator(frequency);
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.1); // seconds
            }
        }

        playSoundBad(frequency?:number) {
            if (this.audioContext) {
                frequency = frequency || 55;
                var oscillator = this.createOscillator(frequency);
                oscillator.type = oscillator.SAWTOOTH;
                oscillator.start(this.audioContext.currentTime); // play now
                oscillator.stop(this.audioContext.currentTime + 0.5); // seconds
            }
        }
    }
}