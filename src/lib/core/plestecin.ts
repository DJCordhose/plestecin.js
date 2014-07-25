/// <reference path="util.ts" />

// TODO: Add JsDoc including types for pure JavaScript users

import GameEventBus = Plestecin.Util.GameEventBus;

module Plestecin {

    export interface GameObject{
        update?(deltaT: number);
        render?();
    }

    export interface GamePlugin {
        init(eventBus: GameEventBus, success: (gamePlugin: GamePlugin) => void, error: (gamePlugin: GamePlugin, cause: Error) => void);
    }

    export class Engine {

        private objects: GameObject[] = [];
        private plugins: GamePlugin[] = [];
        private previousNow = Engine.now();
        public eventBus = new GameEventBus();
        private stopped = false;

        private static now(): number {
            return Date.now() / 10;
        }

        static PRE_UPDATE_EVENT = "preupdate";
        static POST_UPDATE_EVENT = "postupdate";
        static PRE_RENDER_EVENT = "prerender";
        static POST_RENDER_EVENT = "postrender";

        static OBJECT_ADD_EVENT = "add";
        static OBJECT_REMOVE_EVENT = "remove";


        private initPlugins(overallSuccess: () => void, overallError: (gamePlugin: GamePlugin, cause: Error) => void) {
            var pluginCnt = this.plugins.length;
            if (pluginCnt === 0) {
                overallSuccess();
            } else {
                var pluginSuccess = plugin => {
                    pluginCnt--;
                    if (pluginCnt === 0) {
                        overallSuccess();
                    }
                };
                this.plugins.forEach(plugin => plugin.init(this.eventBus, pluginSuccess, overallError));
            }
        }

        start(init?: () => void) {
            var success = () => {
                if (init) {
                    init();
                }
                this.loop();
            };
            var error = (plugin: GamePlugin, cause: Error) => {
                console.error("Plugin " + plugin + " caused error");
                throw cause;
            };

            this.initPlugins(success, error);
        }

        stop() {
            this.stopped = true;
        }

        restart() {
            this.stopped = false;
            this.loop();
        }

        private loop() {
            if (!this.stopped) requestAnimationFrame(this.loop.bind(this));

            var nextNow = Engine.now();
            var deltaT = nextNow - this.previousNow;
            this.previousNow = nextNow;

            this.eventBus.broadcast(this, Engine.PRE_UPDATE_EVENT, {deltaT: deltaT});
            this.objects.forEach(object => object.update && object.update(deltaT));
            this.eventBus.broadcast(this, Engine.POST_UPDATE_EVENT, {deltaT: deltaT});

            this.eventBus.broadcast(this, Engine.PRE_RENDER_EVENT);
            this.objects.forEach(object => object.render && object.render());
            this.eventBus.broadcast(this, Engine.POST_RENDER_EVENT);
        }

        addObject(object: GameObject) {
            this.objects.splice(0, 0, object);
            this.eventBus.broadcast(this, Engine.OBJECT_ADD_EVENT, object);
        }

        removeObject(object: GameObject) {
            this.objects.splice(this.objects.indexOf(object), 1);
            this.eventBus.broadcast(this, Engine.OBJECT_REMOVE_EVENT, object);
        }

        registerPlugin(plugin: GamePlugin) {
            if (plugin) {
                this.plugins.push(plugin);
            }
        }
    }
}
