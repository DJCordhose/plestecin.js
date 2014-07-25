module Plestecin {
    export module Util {
        export function mixin(_sub: any, ..._supers: any[]) {
            _supers.forEach(_super => {
                Object.getOwnPropertyNames(_super.prototype).forEach(p => {
                    _sub.prototype[p] = _super.prototype[p];
                });
            });
        }

        export interface GameEventListener {
            (source: any, type: string, event?: any);
        }

        interface TypeListenerPair {
            listener: GameEventListener;
            type: string;
        }

        export class GameEventBus {
            private listeners: TypeListenerPair[] = [];

            broadcast(source: any, type: string, event?: any) {
                this.listeners.forEach(pair => pair.type === type && pair.listener(source, type, event));
            }

            on(type: string, listener: GameEventListener) {
                // avoid double registration
                this.detach(type, listener);
                this.listeners.push({
                    type: type,
                    listener: listener
                });
            }

            detach(type: string, listener: GameEventListener) {
                this.listeners = this.listeners.filter(pair => !(pair.type === type && pair.listener === listener));
            }
        }

    }

}