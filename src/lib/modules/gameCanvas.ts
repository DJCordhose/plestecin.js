/// <reference path="../core/plestecin.ts" />

// TODO: Add double buffering
module Plestecin {
    export class GameCanvas implements GamePlugin {
        canvas: HTMLCanvasElement;
        context: CanvasRenderingContext2D;

        constructor(conf?: {
            canvasId: string;
            width?: number;
            height?: number;
        }) {

            if (conf) {
                this.canvas = <HTMLCanvasElement>document.getElementById(conf.canvasId);
                if (conf.width) {
                    this.canvas.width = conf.width;
                }
                if (conf.height) {
                    this.canvas.height = conf.height;
                }
                this.context = this.canvas.getContext('2d');
            } else {
                this.fullsizeCanvas();
            }
        }

        init(eventBus: GameEventBus, success: () => void) {
            eventBus.addListener(Engine.PRE_RENDER_EVENT,
                () => this.context.clearRect(0, 0, this.canvas.width, this.canvas.height));
            success();
        }

        private fullsizeCanvas() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');

            window.addEventListener("orientationchange", () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.context = this.canvas.getContext('2d');
            }, false);
        }
    }
}