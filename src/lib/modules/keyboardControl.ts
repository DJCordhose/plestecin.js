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
            if (27 in this.pressed) currentControl['esc'] = true;
            if (13 in this.pressed) currentControl['enter'] = true;
            if (32 in this.pressed) currentControl['space'] = true;
            if (38 in this.pressed) currentControl['up'] = true;
            if (40 in this.pressed) currentControl['down'] = true;
            if (37 in this.pressed) currentControl['left'] = true;
            if (39 in this.pressed) currentControl['right'] = true;
            if (Object.keys(this.pressed).length > 0 && !(27 in this.pressed)) currentControl['any'] = true;

            return currentControl;
        }

    }

}