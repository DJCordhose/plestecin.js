/// <reference path="../core/plestecin.ts" />
/// <reference path="basicPhysics.ts" />


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

        init(eventBus: GameEventBus, success: (gamePlugin: GamePlugin) => void) {
            eventBus.on(Engine.PRE_RENDER_EVENT,
                () => this.clearCanvas());
            success(this);
        }

        private clearCanvas() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        private fullsizeCanvas() {
            this.canvas = document.createElement("canvas");
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            document.body.appendChild(this.canvas);
            this.context = this.canvas.getContext('2d');

            // TODO add listener for change of size as well

            window.addEventListener("orientationchange", () => {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
                this.context = this.canvas.getContext('2d');
            }, false);
        }
    }

    export interface BallConfig extends PhysicalObject {
        color: string;
    }

    export class Ball extends PhysicalObject {
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

    export interface ImageInfo {
        sx?: number;
        sy?: number;
        sw?: number;
        sh?: number;
        dx?: number;
        dy?: number;
        dw?: number;
        dh?: number;
    }
    export interface SpriteConfig extends PhysicalObject {
        image: HTMLImageElement;
        imageInfo?: ImageInfo;
    }

    export class Sprite extends PhysicalObject {
        imageInfo: ImageInfo;
        image: HTMLImageElement;

        constructor(public gameCanvas: GameCanvas, config: SpriteConfig) {
            super(config);
            this.image = config.image;
            this.imageInfo = config.imageInfo || {};
            if (typeof this.imageInfo.sx === 'undefined') {
                this.imageInfo.sx = 0;
            }
            if (typeof this.imageInfo.sy === 'undefined') {
                this.imageInfo.sy = 0;
            }
            if (typeof this.imageInfo.sw === 'undefined') {
                this.imageInfo.sw = this.image.width;
            }
            if (typeof this.imageInfo.sh === 'undefined') {
                this.imageInfo.sh = this.image.height;
            }
            if (typeof this.imageInfo.dw === 'undefined') {
                this.imageInfo.dw = this.imageInfo.sw;
            }
            if (typeof this.imageInfo.dh === 'undefined') {
                this.imageInfo.dh = this.imageInfo.sh;
            }
        }

        render() {
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D#drawImage()
            var dw = this.imageInfo.dw, dh = this.imageInfo.dh,
            // calculate center coordinate, as image takes upper left coordinate
                dx = this.position.x - this.imageInfo.dw / 2, dy = this.position.y - this.imageInfo.dh / 2,
                sx = this.imageInfo.sx, sy = this.imageInfo.sy,
                sw = this.imageInfo.sw, sh = this.imageInfo.sh;

            this.gameCanvas.context.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
}