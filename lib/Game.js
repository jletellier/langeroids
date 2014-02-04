var langeroids = require('./langeroids.js');
var _ = langeroids._;

var defaults = {
    initialized: false
};

var Game = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.isServer = !langeroids.browser;
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

    setComponentListener: function(component) {
        var game = this;
        _.each(_.functions(component), function(value) {
            if (value.indexOf('on', 0) === 0) {
                var once = (value.indexOf('once', 0) === 0);
                var name = value.substr(once ? 4 : 2);
                if (name.length > 0) {
                    name = name.substr(0, 1).toLowerCase() + name.substr(1);
                    game[once ? 'once' : 'on'](name, component[value].bind(component));
                }
            }
        });
    },

    init: function() {
        this.sortComponents();
        this.removeAllListeners();

        var components = this.components;
        for (var i = 0; i < components.length; i++) {
            this.setComponentListener(components[i]);
        }

        this.emit('init', this);
        this.initialized = true;
    },

    addComponent: function(component) {
        this.components.push(component);
        if (_.isString(component.ID)) this.componentsMap[component.ID] = component;
        if (this.initialized) this.init();
    },

    sortComponents: function() {
        this.components = _.sortBy(this.components, 'sortIndex');
    }
});