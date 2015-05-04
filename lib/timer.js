var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    animationLoop: null,
    tStart: null,
    tDuration: 0
};

var Timer = module.exports = function(settings, animationLoop) {
    _.extend(this, defaults);
    if (!_.isUndefined(animationLoop)) this.animationLoop = animationLoop;

    if (_.isObject(settings)) _.extend(this, settings);
    else if (_.isNumber(settings)) this.set(settings);
};

_.extend(Timer.prototype, {
    set: function(duration) {
        this.tStart = this.animationLoop.time;
        this.tDuration = duration || this.tDuration;
    },

    remaining: function() {
        return this.tDuration - (this.animationLoop.time - this.tStart);
    },

    repeat: function() {
        this.tStart = this.animationLoop.time;
    },

    done: function(repeat) {
        var done = (this.remaining() <= 0);
        if (done && repeat) this.repeat();
        return done;
    }
});