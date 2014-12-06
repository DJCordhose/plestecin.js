/// <reference path="../core/plestecin.ts" />
/// <reference path="../core/util.ts" />
/// <reference path="gameCanvas.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Plestecin;
(function (Plestecin) {
    (function (CollisionType) {
        CollisionType[CollisionType["CIRCLE_CIRCLE"] = 0] = "CIRCLE_CIRCLE";
        CollisionType[CollisionType["CIRCLE_BARRIER"] = 1] = "CIRCLE_BARRIER";
    })(Plestecin.CollisionType || (Plestecin.CollisionType = {}));
    var CollisionType = Plestecin.CollisionType;
    var PhysicsEngine = (function () {
        function PhysicsEngine() {
            this.configurations = [];
        }
        PhysicsEngine.prototype.init = function (eventBus, success) {
            var _this = this;
            eventBus.on(Plestecin.Engine.PRE_UPDATE_EVENT, function () { return _this.checkConfigurations(); });
            eventBus.on(Plestecin.Engine.OBJECT_REMOVE_EVENT, function (source, type, event) { return _this.removeAllObjectConfigurations(event); });
            success(this);
        };
        PhysicsEngine.prototype.checkConfigurations = function () {
            this.configurations.forEach(function (configuration) {
                switch (configuration.collisionType) {
                    case 1 /* CIRCLE_BARRIER */:
                        if (PhysicsEngine.circleCollidesWithBarrier(configuration.object1, configuration.object2)) {
                            configuration.callback(configuration.object1, configuration.object2);
                        }
                        break;
                    case 0 /* CIRCLE_CIRCLE */:
                        if (PhysicsEngine.circleCollidesWithCircle(configuration.object1, configuration.object2)) {
                            configuration.callback(configuration.object1, configuration.object2);
                        }
                        break;
                    default:
                        throw new Error("Unknown collision type: " + configuration.collisionType);
                }
            });
        };
        PhysicsEngine.prototype.removeAllObjectConfigurations = function (object) {
            this.configurations = this.configurations.filter(function (configuration) { return configuration.object1 !== object && configuration.object2 !== object; });
        };
        PhysicsEngine.prototype.onCollision = function (physicsConfiguration) {
            physicsConfiguration.collisionType = physicsConfiguration.collisionType || 0 /* CIRCLE_CIRCLE */;
            this.configurations.push(physicsConfiguration);
        };
        // http://www.adambrookesprojects.co.uk/project/canvas-collision-elastic-collision-tutorial/
        PhysicsEngine.circleCollidesWithCircle = function (object1, object2) {
            // a^2 + b^2 = c^2
            var a = object1.position.x - object2.position.x;
            var b = object1.position.y - object2.position.y;
            var r1 = object2.r;
            var r2 = object1.r;
            var c = r1 + r2;
            return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) < c;
        };
        // TODO
        // Circle/Line-Intersection
        // http://devmag.org.za/2009/04/17/basic-collision-detection-in-2d-part-2/
        PhysicsEngine.circleCollidesWithBarrier = function (object1, object2) {
            throw new Error("Not yet implemented");
        };
        return PhysicsEngine;
    })();
    Plestecin.PhysicsEngine = PhysicsEngine;
    var PhysicalObject = (function () {
        function PhysicalObject(config) {
            this.position = config.position;
            this.r = config.r;
        }
        return PhysicalObject;
    })();
    Plestecin.PhysicalObject = PhysicalObject;
    var BarrierObject = (function (_super) {
        __extends(BarrierObject, _super);
        function BarrierObject(config) {
            _super.call(this, config);
            this.endPosition = config.endPosition;
        }
        return BarrierObject;
    })(PhysicalObject);
    Plestecin.BarrierObject = BarrierObject;
    var MovingObject = (function (_super) {
        __extends(MovingObject, _super);
        function MovingObject(eventBus, gameCanvas, config) {
            _super.call(this, config);
            this.eventBus = eventBus;
            this.gameCanvas = gameCanvas;
            this.applyGravity = function (deltaT) {
                var gravity = this.gravity || 0;
                this.velocity.y += gravity * deltaT;
            };
            this.velocity = config.velocity || {
                x: 0,
                y: 0
            };
            this.maxSpeed = config.maxSpeed;
            this.gravity = config.gravity || 0;
            this.acceleration = config.acceleration || 0;
            this.friction = config.friction || 0;
        }
        MovingObject.prototype.inertiaMove = function (deltaT) {
            this.moveByVelocity(deltaT);
            this.bounceOnEdges();
            this.applyGravity(deltaT);
            this.applyFriction(deltaT);
            this.limitSpeed();
        };
        MovingObject.prototype.moveByVelocity = function (deltaT) {
            this.position.x += this.velocity.x * deltaT;
            this.position.y += this.velocity.y * deltaT;
        };
        // FIXME: This should not have a reference to canvas, but s
        // should be solved using borders, but they are lacking a collision detection
        MovingObject.prototype.bounceOnEdges = function () {
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
        };
        MovingObject.prototype.notifyOfBounce = function () {
            if (this.eventBus) {
                this.eventBus.broadcast(this, MovingObject.BOUNCE_EVENT, {
                    position: this.position,
                    velocity: this.velocity
                });
            }
        };
        MovingObject.prototype.applyFriction = function (deltaT) {
            var friction = this.friction || 0;
            this.velocity.x = this.velocity.x + (this.velocity.x > 0 ? -1 : +1) * friction * deltaT;
            this.velocity.y = this.velocity.y + (this.velocity.y > 0 ? -1 : +1) * friction * deltaT;
        };
        MovingObject.prototype.limitSpeed = function () {
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
        };
        MovingObject.prototype.movesLeft = function () {
            return this.velocity.x <= 0 && Math.abs(this.velocity.x) >= Math.abs(this.velocity.y);
        };
        MovingObject.prototype.movesRight = function () {
            return this.velocity.x > 0 && Math.abs(this.velocity.x) >= Math.abs(this.velocity.y);
        };
        MovingObject.prototype.movesUp = function () {
            return this.velocity.y <= 0 && Math.abs(this.velocity.x) <= Math.abs(this.velocity.y);
        };
        MovingObject.prototype.movesDown = function () {
            return this.velocity.y > 0 && Math.abs(this.velocity.x) <= Math.abs(this.velocity.y);
        };
        MovingObject.BOUNCE_EVENT = "bounce";
        return MovingObject;
    })(PhysicalObject);
    Plestecin.MovingObject = MovingObject;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=basicPhysics.js.map