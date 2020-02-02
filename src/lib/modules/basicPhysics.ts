/// <reference path="../core/plestecin.ts" />
/// <reference path="../core/util.ts" />
/// <reference path="gameCanvas.ts" />

module Plestecin {

    export enum CollisionType {
        CIRCLE_CIRCLE,
        CIRCLE_BARRIER
    }

    export interface PhysicsConfiguration {
        object1: PhysicalObject;
        object2: PhysicalObject;
        callback(object1: PhysicalObject, object2: PhysicalObject): void;
        collisionType?: CollisionType;
    }

    export class PhysicsEngine implements GamePlugin {
        private configurations: PhysicsConfiguration[] = [];

        init(eventBus: GameEventBus, success: (gamePlugin: GamePlugin) => void) {
            eventBus.on(Engine.PRE_UPDATE_EVENT, () => this.checkConfigurations());
            eventBus.on(Engine.OBJECT_REMOVE_EVENT, (source: any, type: string, event: GameObject) => this.removeAllObjectConfigurations(event));
            success(this);
        }

        private checkConfigurations() {
            this.configurations.forEach(configuration => {
                switch (configuration.collisionType) {
                    case CollisionType.CIRCLE_BARRIER:
                        if (PhysicsEngine.circleCollidesWithBarrier(configuration.object1, <BarrierObject>configuration.object2)) {
                            configuration.callback(configuration.object1, configuration.object2);
                        }
                        break;
                    case CollisionType.CIRCLE_CIRCLE:
                        if (PhysicsEngine.circleCollidesWithCircle(configuration.object1, configuration.object2)) {
                            configuration.callback(configuration.object1, configuration.object2);
                        }
                        break;
                    default :
                        throw new Error("Unknown collision type: " + configuration.collisionType);
                }
            });
        }

        private removeAllObjectConfigurations(object: GameObject) {
            this.configurations =
                this.configurations.filter(configuration => configuration.object1 !== object && configuration.object2 !== object);
        }

        onCollision(physicsConfiguration: PhysicsConfiguration) {
            physicsConfiguration.collisionType = physicsConfiguration.collisionType || CollisionType.CIRCLE_CIRCLE;
            this.configurations.push(physicsConfiguration);
        }

        // http://www.adambrookesprojects.co.uk/project/canvas-collision-elastic-collision-tutorial/
        static circleCollidesWithCircle(object1: PhysicalObject, object2: PhysicalObject): boolean {
            // a^2 + b^2 = c^2
            var a = object1.position.x - object2.position.x;
            var b = object1.position.y - object2.position.y;
            var r1 = object2.r;
            var r2 = object1.r;
            var c = r1 + r2;
            return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) < c;
        }

        // TODO
        // Circle/Line-Intersection
        // http://devmag.org.za/2009/04/17/basic-collision-detection-in-2d-part-2/
        static circleCollidesWithBarrier(object1: PhysicalObject, object2: BarrierObject): boolean {
            throw new Error("Not yet implemented");
        }

    }

    export class PhysicalObject /* implements GameObject */ {
        position: {
            x: number;
            y: number;
        };
        r: number;

        constructor(config: PhysicalObject) {
            this.position = config.position;
            this.r = config.r;
        }
    }

    export class BarrierObject extends PhysicalObject {
        endPosition: {
            x: number;
            y: number;
        };

        constructor(config: BarrierObject) {
            super(config)
            this.endPosition = config.endPosition;
        }

    }

    export interface MovingObjectConfig extends PhysicalObject {
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

        static BOUNCE_EVENT = "bounce";

        constructor(public eventBus: GameEventBus, public gameCanvas: GameCanvas, config: MovingObjectConfig) {
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

        // FIXME: This should not have a reference to canvas, but s
        // should be solved using borders, but they are lacking a collision detection
        bounceOnEdges() {
            if (this.position.x - this.r <= 0) {
                this.position.x = this.r;
                this.velocity.x = -this.velocity.x;
                this.notifyOfBounce();
            }
            if (this.position.x + this.r >= this.gameCanvas.canvas.width) {
                this.position.x = this.gameCanvas.canvas.width - this.r;
                this.velocity.x = -this.velocity.x;
                this.notifyOfBounce();
            }
            if (this.position.y - this.r <= 0) {
                this.position.y = this.r;
                this.velocity.y = -this.velocity.y;
                this.notifyOfBounce();
            }
            if (this.position.y + this.r >= this.gameCanvas.canvas.height) {
                this.position.y = this.gameCanvas.canvas.height - this.r;
                this.velocity.y = -this.velocity.y;
                this.notifyOfBounce();
            }
        }

        private notifyOfBounce() {
            if (this.eventBus) {
                this.eventBus.broadcast(this, MovingObject.BOUNCE_EVENT, {
                    position: this.position,
                    velocity: this.velocity
                });
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