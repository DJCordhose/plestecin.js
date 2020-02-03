/// <reference path="util.ts" />
// TODO: Add JsDoc including types for pure JavaScript users
var GameEventBus = Plestecin.Util.GameEventBus;
var Plestecin;
(function (Plestecin) {
    var Engine = /** @class */ (function () {
        function Engine() {
            //        private objects: GameObject[] = [];
            this.plugins = [];
            this.previousNow = Engine.now();
            // TODO: Should this be part of of the Game State? If so, how do we update reference to the eventbus from plugins and objects?
            this.eventBus = new GameEventBus();
            this.stopped = false;
            this.currentState = Engine.MAIN_STATE_NAME;
            this.states = {
                main: Engine.initState(Engine.MAIN_STATE_NAME)
            };
        }
        Engine.initState = function (name) {
            return {
                name: name,
                objects: []
                //                eventBus: new GameEventBus()
            };
        };
        Engine.now = function () {
            return Date.now() / 10;
        };
        Engine.prototype.initPlugins = function (overallSuccess, overallError) {
            var _this = this;
            var pluginCnt = this.plugins.length;
            if (pluginCnt === 0) {
                overallSuccess();
            }
            else {
                var pluginSuccess = function (plugin) {
                    pluginCnt--;
                    if (pluginCnt === 0) {
                        overallSuccess();
                    }
                };
                this.plugins.forEach(function (plugin) { return plugin.init(_this.eventBus, pluginSuccess, overallError); });
            }
        };
        Engine.prototype.addState = function (state) {
            this.states[state.name] = state;
        };
        Engine.prototype.switchState = function (name) {
            this.currentState = name;
        };
        Engine.prototype.getCurrentState = function () {
            var state = this.states[this.currentState];
            if (!state) {
                throw new Error("Current state: " + this.currentState + " has not been initialized!");
            }
            else {
                return state;
            }
        };
        Engine.prototype.start = function (init) {
            var _this = this;
            var success = function () {
                if (init) {
                    init();
                }
                _this.loop();
            };
            var error = function (plugin, cause) {
                console.error("Plugin " + plugin + " caused error");
                throw cause;
            };
            this.initPlugins(success, error);
        };
        Engine.prototype.stop = function () {
            this.stopped = true;
        };
        Engine.prototype.restart = function () {
            this.stopped = false;
            this.loop();
        };
        Engine.prototype.loop = function () {
            if (!this.stopped)
                requestAnimationFrame(this.loop.bind(this));
            var nextNow = Engine.now();
            var deltaT = nextNow - this.previousNow;
            this.previousNow = nextNow;
            this.eventBus.broadcast(this, Engine.PRE_UPDATE_EVENT, { deltaT: deltaT });
            this.getCurrentState().objects.forEach(function (object) { return object.update && object.update(deltaT); });
            this.eventBus.broadcast(this, Engine.POST_UPDATE_EVENT, { deltaT: deltaT });
            this.eventBus.broadcast(this, Engine.PRE_RENDER_EVENT);
            this.getCurrentState().objects.forEach(function (object) { return object.render && object.render(); });
            this.eventBus.broadcast(this, Engine.POST_RENDER_EVENT);
        };
        Engine.prototype.addObject = function (object) {
            this.getCurrentState().objects.splice(0, 0, object);
            this.eventBus.broadcast(this, Engine.OBJECT_ADD_EVENT, object);
        };
        Engine.prototype.removeObject = function (object) {
            this.getCurrentState().objects.splice(this.getCurrentState().objects.indexOf(object), 1);
            this.eventBus.broadcast(this, Engine.OBJECT_REMOVE_EVENT, object);
        };
        Engine.prototype.resetObjects = function () {
            var _this = this;
            this.getCurrentState().objects.forEach(function (object) {
                _this.eventBus.broadcast(_this, Engine.OBJECT_REMOVE_EVENT, object);
            });
            this.getCurrentState().objects = [];
        };
        Engine.prototype.registerPlugin = function (plugin) {
            if (plugin) {
                this.plugins.push(plugin);
            }
        };
        Engine.MAIN_STATE_NAME = 'main';
        Engine.PRE_UPDATE_EVENT = "preupdate";
        Engine.POST_UPDATE_EVENT = "postupdate";
        Engine.PRE_RENDER_EVENT = "prerender";
        Engine.POST_RENDER_EVENT = "postrender";
        Engine.OBJECT_ADD_EVENT = "add";
        Engine.OBJECT_REMOVE_EVENT = "remove";
        return Engine;
    }());
    Plestecin.Engine = Engine;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=plestecin.js.map