var _ = require('underscore');
var Box2D = require('box2d.js').Box2D;

var defaults = {
    gravity: 9.81
};

var Game = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, this.gravity));
};

_.extend(Game.prototype, {
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
        this.world.Step(1 / 60, 3, 2);
        this.update();
        this.draw();
    },

    update: function() {},
    draw: function() {}
});