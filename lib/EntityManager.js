var _ = require('underscore');

var defaults = {
    parentMember: 'entityManager',
    initialized: false
};

var EntityManager = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.entities = [];
};

_.extend(EntityManager.prototype, {
    init: function(game) {
        this.game = game;

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].init(game);
        }
        this.initialized = true;
    },

    update: function(game) {
        var entitiesKilled = false;

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update(game);
            if (this.entities[i].killed) entitiesKilled = true;
        }

        // remove killed entities
        if (entitiesKilled) {
            this.entities = _.filter(this.entities, function(entity) {
                return (!entity.killed);
            });
        }
    },

    draw: function(game, renderer) {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(game, renderer);
        }
    },

    add: function(entity) {
        this.entities.push(entity);
        if (this.initialized) entity.init(this.game);
    },

    sort: function() {
        this.entities = _.sortBy(this.entities, 'sortIndex');
    }
});