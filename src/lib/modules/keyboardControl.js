/// <reference path="../core/plestecin.ts" />
var Plestecin;
(function (Plestecin) {
    var KeyboardControl = /** @class */ (function () {
        function KeyboardControl() {
            this.pressed = {};
        }
        KeyboardControl.prototype.init = function (eventBus, success) {
            var _this = this;
            window.onkeydown = function (e) {
                if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 32) {
                    e.preventDefault();
                }
                _this.pressed[e.keyCode] = true;
            };
            window.onkeyup = function (e) { return delete _this.pressed[e.keyCode]; };
            success(this);
        };
        KeyboardControl.prototype.cursorControl = function () {
            var currentControl = {};
            if (27 in this.pressed)
                currentControl['esc'] = true;
            if (13 in this.pressed)
                currentControl['enter'] = true;
            if (32 in this.pressed)
                currentControl['space'] = true;
            if (38 in this.pressed)
                currentControl['up'] = true;
            if (40 in this.pressed)
                currentControl['down'] = true;
            if (37 in this.pressed)
                currentControl['left'] = true;
            if (39 in this.pressed)
                currentControl['right'] = true;
            if (Object.keys(this.pressed).length > 0 && !(27 in this.pressed))
                currentControl['any'] = true;
            return currentControl;
        };
        return KeyboardControl;
    }());
    Plestecin.KeyboardControl = KeyboardControl;
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=keyboardControl.js.map