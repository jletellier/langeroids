'use strict';

let langeroids = require('./langeroids');

let defaults = {
    id: 'entity-manager',
    initialized: false
};

let EntityManager = function(settings) {
    Object.assign(this, defaults, settings);

    this.setMaxListeners(0);
    this.entities = [];
};

langeroids.inherits(EntityManager, langeroids.EventEmitter);

Object.assign(EntityManager.prototype, {
    onDefault: function(type) {
        this.emit.apply(this, Array.prototype.slice.call(arguments, 0));
    },

    onInit: function() {
        this.initialized = true;
    },

    onUpdate: function() {
        let entitiesKilled = false;

        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].killed) entitiesKilled = true;
        }

        // remove killed entities
        if (entitiesKilled) {
            let self = this;
            this.entities = this.entities.filter(function(entity) {
                if (entity.killed) {
                    langeroids.removeComponentListeners(self, entity);
                }
                return (!entity.killed);
            });
        }
    },

    setEntityMethods: function(entity) {
        let self = this;
        entity.emit = function(type, args) {
            self.emit.apply(self, arguments);
        };
        entity.getComponent = function(id) {
            return self.getComponent(id);
        };
    },

    add: function(entity) {
        this.entities.push(entity);
        this.setEntityMethods(entity);
        langeroids.findComponentListeners(entity);
        langeroids.setComponentListeners(this, entity);
        if (this.initialized && typeof entity.onInit === 'function') entity.onInit();
    },

    sort: function() {
        // TODO: Implement sorting
        //this.entities = _.sortBy(this.entities, 'sortIndex');
        // TODO: sort event listener
    }
});

module.exports = EntityManager;
