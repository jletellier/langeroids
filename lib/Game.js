var _ = require('underscore');
var langeroids = require('./langeroids.js');

var defaults = {
    componentsOrder: [ 'physics', 'logic', 'renderer' ]
};

var Game = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.components = [];
    this.componentsList = [];
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
        this.draw();
    },

    init: function() {
        for (var i = 0; i < this.componentsList.length; i++) {
            this.componentsList[i].init(this);
        }
    },

    update: function() {
        for (var i = 0; i < this.componentsList.length; i++) {
            this.componentsList[i].update(this);
        }
    },

    draw: function() {
        for (var i = 0; i < this.componentsList.length; i++) {
            this.componentsList[i].draw(this, this.renderer);
        }
    },

    kill: function() {},

    addComponent: function(component) {
        this.components.push(component);

        if (component.type === 'renderer') this.renderer = component;
    },

    sortComponents: function() {
        this.componentsList = [];
        for (var i = 0; i < this.components.length; i++) {
            // TODO: add sort logic
            this.componentsList.push(this.components[i]);
        }
    }
});