/// <reference path="../core/plestecin.ts" />

module Plestecin {

    export class KeyboardControl implements GamePlugin {
        private pressed = {};

        init(eventBus: GameEventBus, success: (gamePlugin: GamePlugin) => void) {
            window.onkeydown = e => {
                if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 32) {
                    e.preventDefault();
                }
                this.pressed[e.keyCode] = true;
            };

            window.onkeyup = e => delete this.pressed[e.keyCode];

            success(this);
        }

        cursorControl() {
            var currentControl = {};
            if (38 in this.pressed) currentControl['up'] = true;
            if (40 in this.pressed) currentControl['down'] = true;
            if (37 in this.pressed) currentControl['left'] = true;
            if (39 in this.pressed) currentControl['right'] = true;
            return currentControl;
        }

    }

}