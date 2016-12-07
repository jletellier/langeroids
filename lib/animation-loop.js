'use strict';

let Timer = require('./timer');

let defaults = {
    id: 'animation-loop',
    autoStart: true,
    time: null,
    elapsed: 0
};

let AnimationLoop = function(settings) {
    Object.assign(this, defaults, settings);
};

Object.assign(AnimationLoop.prototype, {
    start: function() {
        this.startLoop();
    },

    startLoop: function() {
        let self = this;
        function animationLoop(time) {
            self.requestId = requestAnimationFrame(animationLoop);
            self.elapsed = time - self.time;
            self.time = time;
            if (self.elapsed > 0) self.run();
        }
        this.requestId = requestAnimationFrame(animationLoop);
    },

    stop: function() {
        cancelAnimationFrame(this.requestId);
    },

    run: function() {
        this.emit('update');
    },

    onInit: function(cm) {
        this.cm = cm;
        if (this.autoStart) this.start();
    },

    getTimer: function(settings) {
        return new Timer(settings, this);
    }
});

module.exports = AnimationLoop;
