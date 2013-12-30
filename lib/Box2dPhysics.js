var _ = require('underscore');
var Box2D = require('box2d.js').Box2D;

var defaults = {
    parentMember: 'physics',
    gravity: 9.81,
    b2scale: 0.1
};

var Box2dPhysics = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(Box2dPhysics.prototype, {
    init: function() {
        this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, this.gravity));
    },

    update: function() {
        this.world.Step(1 / 60, 3, 2);
    },

    draw: function() {}
});