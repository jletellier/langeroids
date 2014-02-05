var langeroids = require('./langeroids.js');
var _ = langeroids._;

var defaults = {
    initialized: false
};

var Game = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.components = [];
    this.componentsMap = {};
};

langeroids.inherits(Game, langeroids.EventEmitter);

_.extend(Game.prototype, {
    start: function() {
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
        this.initialized = false;
    },

    run: function() {
        this.emit('update');
    },

    emit: function(type) {
        Game.super_.prototype.emit.apply(this, arguments);
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift('default');
        Game.super_.prototype.emit.apply(this, args);
    },

    init: function() {
        this.sortComponents();
        this.removeAllListeners();

        var components = this.components;
        for (var i = 0; i < components.length; i++) {
            langeroids.setComponentListener(this, components[i]);
        }

        this.emit('init', this);
        this.initialized = true;
    },

    addComponent: function(component) {
        this.components.push(component);
        if (_.isString(component.id)) this.componentsMap[component.id] = component;
        if (this.initialized) this.init();
    },

    sortComponents: function() {
        this.components = _.sortBy(this.components, 'sortIndex');
    },

    getComponent: function(component) {
        if (_.isString(component)) {
            return this.componentsMap[component];
        }
        return false;
    }
});