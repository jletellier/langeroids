'use strict';

var defaults = {
    animationLoop: null,
    tStart: null,
    tDuration: 0
};

var Timer = function(settings, animationLoop) {
    Object.assign(this, defaults);
    if (animationLoop !== undefined) this.animationLoop = animationLoop;

    if (!isNaN(settings)) this.set(settings);
    else Object.assign(this, settings);
};

Object.assign(Timer.prototype, {
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

module.exports = Timer;
