var langeroids = require('./langeroids.js');
var _ = langeroids._;

var defaults = {
    id: 'entityManager',

    initialized: false
};

var EntityManager = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.setMaxListeners(0);
    this.entities = [];
};

langeroids.inherits(EntityManager, langeroids.EventEmitter);

_.extend(EntityManager.prototype, {
    onDefault: function(type) {
        this.emit.apply(this, Array.prototype.slice.call(arguments, 0));
    },

    onInit: function(game) {
        this.game = game;
        this.initialized = true;
    },

    onUpdate: function() {
        var entitiesKilled = false;

        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].killed) entitiesKilled = true;
        }

        // remove killed entities
        if (entitiesKilled) {
            var self = this;
            this.entities = _.filter(this.entities, function(entity) {
                if (entity.killed) {
                    langeroids.removeComponentListener(self, entity);
                }
                return (!entity.killed);
            });
        }
    },

    add: function(entity) {
        this.entities.push(entity);
        langeroids.setComponentListener(this, entity);
        if (this.initialized && _.isFunction(entity.onInit)) entity.onInit(this.game);
    },

    sort: function() {
        this.entities = _.sortBy(this.entities, 'sortIndex');
        // TODO: sort event listener
    }
});