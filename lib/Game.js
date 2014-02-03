var _ = require('underscore');
var langeroids = require('./langeroids.js');

var defaults = {
    initialized: false
};

var Game = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.isServer = !langeroids.browser;
    this.components = [];
};

_.extend(Game.prototype, {
    start: function() {
        this.sortComponents();
        this.init();
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
        this.update();
        if (!this.isServer) this.draw();
    },

    init: function() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].init(this);
        }
        this.initialized = true;
    },

    update: function() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].update(this);
        }
    },

    draw: function() {
        for (var i = 0; i < this.components.length; i++) {
            this.components[i].draw(this, this.renderer);
        }
    },

    addComponent: function(component) {
        this.components.push(component);
        if (_.isString(component.ID)) this[component.ID] = component;
        if (this.initialized) component.init();
    },

    sortComponents: function() {
        this.components = _.sortBy(this.components, 'sortIndex');
    }
});