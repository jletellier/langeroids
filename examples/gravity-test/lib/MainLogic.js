var _ = require('underscore');
var Timer = require('langeroids/lib/Timer.js');

var MainLogic = module.exports = function(settings) {
    _.extend(this, settings);
};

_.extend(MainLogic.prototype, {
    init: function(game) {
        this.currentHColor = 0;
        this.currentHColorDirection = -1;
        this.colorChangeInterval = 100;
        this.colorChangeTimer = new Timer({
            game: game,
            tDuration: this.colorChangeInterval
        });
    },

    update: function(game) {
        if (this.colorChangeTimer.done()) {
            if (this.currentHColor == 360 || this.currentHColor == 0) this.currentHColorDirection *= -1;
            this.currentHColor += this.currentHColorDirection;
            this.colorChangeTimer.repeat();
        }
    },

    draw: function(game, renderer) {
        renderer.clear('hsla(' + this.currentHColor + ',61%,56%,0.5)');
    }
});