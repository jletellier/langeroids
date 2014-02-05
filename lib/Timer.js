var langeroids = require('./langeroids.js');
var _ = langeroids._;

var defaults = {
    game: null,
    tStart: null,
    tDuration: 0
};

var Timer = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(Timer.prototype, {
    set: function(duration) {
        this.tStart = this.game.time;
        this.tDuration = duration || this.tDuration;
    },

    remaining: function() {
        return this.tDuration - (this.game.time - this.tStart);
    },

    repeat: function() {
        this.tStart = this.game.time;
    },

    done: function() {
        return (this.remaining() <= 0);
    }
});