var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    id: 'animation-loop',
    autoStart: true
};

var AnimationLoop = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(AnimationLoop.prototype, {
    start: function() {
        this.startLoop();
    },

    startLoop: function() {
        var self = this;
        function animationLoop(time) {
            self.requestId = requestAnimationFrame(animationLoop);
            self.time = time;
            self.run();
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
    }
});