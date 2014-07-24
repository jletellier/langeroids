var langeroids = require('./langeroids');
var _ = langeroids._;

var RequireBox2D = require('box2d.js').Box2D;
var Box = (!langeroids.browser) ? RequireBox2D : window.Box2D;

var defaults = {
    id: 'physics',
    sortIndex: 1001,

    gravity: 9.81,
    b2scale: 0.1
};

var Box2dPhysics = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.Box2D = Box;
};

_.extend(Box2dPhysics.prototype, {
    onInit: function(game) {
        this.game = game;
        this.world = new this.Box2D.b2World(new this.Box2D.b2Vec2(0.0, this.gravity));
    },

    onUpdate: function() {
        this.world.Step(1 / 60, 3, 2);
    }
});