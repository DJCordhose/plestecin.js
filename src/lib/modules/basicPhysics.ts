/// <reference path="../core/plestecin.ts" />
/// <reference path="gameCanvas.ts" />

module Plestecin {

    export interface PhysicalObjectConfig {
        position: {
            x: number;
            y: number;
        };
        r: number;
    }


    export class PhysicalObject {
        position: {
            x: number;
            y: number;
        };
        r: number;

        constructor(config: PhysicalObjectConfig) {
            this.position = config.position;
            this.r = config.r;
        }

        // http://www.adambrookesprojects.co.uk/project/canvas-collision-elastic-collision-tutorial/
        collidesWith(other: PhysicalObjectConfig): boolean {
            // a^2 + b^2 = c^2
            var a = other.position.x - this.position.x;
            var b = other.position.y - this.position.y;
            var r1 = this.r;
            var r2 = other.r;
            var c = r1 + r2;
            return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) < c;
        }
    }

    export class Border extends PhysicalObject {
        endPosition: {
            x: number;
            y: number;
        };
        constructor(config: Border) {
            super(config)
            this.endPosition= config.endPosition;
        }

        // TODO
        // Circle/Line-Intersection
        // http://devmag.org.za/2009/04/17/basic-collision-detection-in-2d-part-2/
        collidesWith(other: PhysicalObject): boolean {
            throw new Error("Not yet implemented");
            if (this.position.x === this.endPosition.x) {
                return true;
            } else if (this.position.y === this.endPosition.y) {
            } else {
                throw new Error("Border can not be diagonal, yet");
            }
        }
    }

    export interface MovingObjectConfig extends PhysicalObjectConfig {
        velocity?: {
            x: number;
            y: number;
        };
        maxSpeed?: number;
        gravity?: number;
        acceleration?: number;
        friction?: number;
    }

    export class MovingObject extends PhysicalObject {
        velocity: {
            x: number;
            y: number;
        };
        maxSpeed: number;
        gravity: number;
        acceleration: number;
        friction: number;

        constructor(public gameCanvas: GameCanvas, config: MovingObjectConfig) {
            super(config);
            this.velocity = config.velocity || {
                x: 0,
                y: 0
            };
            this.maxSpeed = config.maxSpeed;
            this.gravity = config.gravity || 0;
            this.acceleration = config.acceleration || 0;
            this.friction = config.friction || 0;
        }

        inertiaMove(deltaT: number) {
            this.moveByVelocity(deltaT);
            this.bounceOnEdges();
            this.applyGravity(deltaT);
            this.applyFriction(deltaT);
            this.limitSpeed();
        }

        moveByVelocity(deltaT) {
            this.position.x += this.velocity.x * deltaT;
            this.position.y += this.velocity.y * deltaT;
        }

        // TODO: Should be solved using borders, but they are lacking a collision detection
        bounceOnEdges() {
            if (this.position.x - this.r <= 0) {
                this.position.x = this.r;
                this.velocity.x = -this.velocity.x;
            }
            if (this.position.x + this.r >= this.gameCanvas.canvas.width) {
                this.position.x = this.gameCanvas.canvas.width - this.r;
                this.velocity.x = -this.velocity.x;
            }
            if (this.position.y - this.r <= 0) {
                this.position.y = this.r;
                this.velocity.y = -this.velocity.y;
            }
            if (this.position.y + this.r >= this.gameCanvas.canvas.height) {
                this.position.y = this.gameCanvas.canvas.height - this.r;
                this.velocity.y = -this.velocity.y;
            }
        }

        applyGravity = function (deltaT) {
            var gravity = this.gravity || 0;
            this.velocity.y += gravity * deltaT;
        }

        applyFriction(deltaT) {
            var friction = this.friction || 0;
            this.velocity.x = this.velocity.x + (this.velocity.x > 0 ? -1 : +1) * friction * deltaT;
            this.velocity.y = this.velocity.y + (this.velocity.y > 0 ? -1 : +1) * friction * deltaT;
        }

        limitSpeed() {
            var maxSpeed = this.maxSpeed || Number.MAX_VALUE;
            if (this.velocity.x > 0 && this.velocity.x > this.maxSpeed) {
                this.velocity.x = this.maxSpeed;
            }
            if (this.velocity.x < 0 && -this.velocity.x > this.maxSpeed) {
                this.velocity.x = -this.maxSpeed;
            }
            if (this.velocity.y > 0 && this.velocity.y > this.maxSpeed) {
                this.velocity.y = this.maxSpeed;
            }
            if (this.velocity.y < 0 && -this.velocity.y > this.maxSpeed) {
                this.velocity.y = -this.maxSpeed;
            }
        }

        movesLeft() {
            return this.velocity.x <= 0 && Math.abs(this.velocity.x) >= Math.abs(this.velocity.y);
        }

        movesRight() {
            return this.velocity.x > 0 && Math.abs(this.velocity.x) >= Math.abs(this.velocity.y);
        }

        movesUp() {
            return this.velocity.y <= 0 && Math.abs(this.velocity.x) <= Math.abs(this.velocity.y);
        }

        movesDown() {
            return this.velocity.y > 0 && Math.abs(this.velocity.x) <= Math.abs(this.velocity.y);
        }


    }
}