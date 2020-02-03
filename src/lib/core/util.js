var Plestecin;
(function (Plestecin) {
    var Util;
    (function (Util) {
        function mixin(_sub) {
            var _supers = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                _supers[_i - 1] = arguments[_i];
            }
            _supers.forEach(function (_super) {
                Object.getOwnPropertyNames(_super.prototype).forEach(function (p) {
                    _sub.prototype[p] = _super.prototype[p];
                });
            });
        }
        Util.mixin = mixin;
        var GameEventBus = /** @class */ (function () {
            function GameEventBus() {
                this.listeners = [];
            }
            GameEventBus.prototype.broadcast = function (source, type, event) {
                this.listeners.forEach(function (pair) { return pair.type === type && pair.listener(source, type, event); });
            };
            GameEventBus.prototype.on = function (type, listener) {
                // avoid double registration
                this.detach(type, listener);
                this.listeners.push({
                    type: type,
                    listener: listener
                });
            };
            GameEventBus.prototype.detach = function (type, listener) {
                this.listeners = this.listeners.filter(function (pair) { return !(pair.type === type && pair.listener === listener); });
            };
            return GameEventBus;
        }());
        Util.GameEventBus = GameEventBus;
    })(Util = Plestecin.Util || (Plestecin.Util = {}));
})(Plestecin || (Plestecin = {}));
//# sourceMappingURL=util.js.map