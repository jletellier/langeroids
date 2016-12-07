'use strict';

let langeroids = require('./langeroids');

let defaults = {
    id: 'component-manager',
    initialized: false
};

let ComponentManager = function(settings) {
    Object.assign(this, defaults, settings);

    this.setMaxListeners(0);
    this.components = [];
    this.componentsMap = {};
    this.workers = [];
};

langeroids.inherits(ComponentManager, langeroids.EventEmitter);
let Parent = ComponentManager.super_;

Object.assign(ComponentManager.prototype, {
    emit: function(type, args, transferables, callerId) {
        Parent.prototype.emit.apply(this, [ type, args, callerId ]);

        // emit to workers
        if (!langeroids.isArray(transferables)) transferables = [];
        let workerArgs = args || [];
        for (let i = 0; i < this.workers.length; i++) {
            let worker = this.workers[i];
            if (worker._listeners[type] === true) {
                if (type === 'init') workerArgs = null;
                worker.postMessage({ type: type, args: workerArgs, callerId: callerId }, transferables);
            }
        }

        // emit default event
        Parent.prototype.emit.apply(this, [ 'default', type, args, callerId ]);
    },

    init: function() {
        this.sort();
        this.removeAllListeners();

        let components = this.components;
        for (let i = 0; i < components.length; i++) {
            if (!components[i].useConcurrency) {
                langeroids.setComponentListeners(this, components[i], true);
            }
        }

        this.emit('init', this, null, this.id);
        this.initialized = true;
    },

    add: function(component) {
        langeroids.findComponentListeners(component);

        this.setComponentMethods(component);

        this.components.push(component);
        if (langeroids.isString(component.id)) this.componentsMap[component.id] = component;

        if (component.useConcurrency) {
            this.createWorker(component);
        }

        if (this.initialized) this.init();
    },

    remove: function(component) {
        if (langeroids.isString(component)) {
            component = this.getById(component);
        }
        if (component) {
            component.emit('destroy', this, null, this.id);

            // TODO: Remove worker
            if (component.useConcurrency) {

            }

            langeroids.removeComponentListeners(this, component);

            if (langeroids.isString(component.id)) this.componentsMap[component.id] = null;
            let index = this.components.indexOf(component);
            if (index > -1) {
                this.components.splice(index, 1);
            }
        }
    },

    setComponentMethods: function(component) {
        let self = this;
        if (!(component instanceof langeroids.EventEmitter)) {
            component.emit = function(type, args, transferables) {
                self.emit.apply(self, [ type, args, transferables, this.id ]);
            };
        }
        // TODO: Test if 'bind' is faster than scope
        component.getComponent = function(id) {
            return self.getById(id);
        };
        component.destroy = function() {
            self.remove(this);
        };
    },

    sort: function() {
        // TODO: Fix sorting
        //this.components = _.sortBy(this.components, 'sortIndex');
    },

    getById: function(component) {
        if (langeroids.isString(component)) {
            return this.componentsMap[component];
        }
        return false;
    },

    workerMessageEvent: function(event) {
        this.emit(event.data.type, event.data.args, null, event.target._componentId);
    },

    createWorker: function(component) {
        component = (langeroids.isString(component)) ? this.componentsMap[component] : component;

        // convert component members (properties, functions) to strings
        let prototypeStr = 'Class.prototype.';
        let members = [];
        Object.keys(component).forEach(function(value) {
            if (typeof component[value] === 'function') {
                members.push(prototypeStr + value + '=' + component[value].toString());
            }
            else {
                members.push(prototypeStr + value + '=' + JSON.stringify(component[value]));
            }
        });

        // create worker message events
        let workerMessageStr = function() {
            let component = new Class();
            component.emit = function(type, args, transferables) {
                self.postMessage({ type: type, args: args }, transferables);
            };
            self.addEventListener('message', function(event) {
                let type = event.data.type;
                type = 'on' + type.charAt(0).toUpperCase() + type.slice(1);
                // TODO: include once
                if (typeof component[type] === 'function') component[type](event.data.args, event.data.callerId);
            }, false);
        }.toString();

        // create final BLOB
        let blob = new Blob([
            'var Class = function() {};',
            members.join(';'), ';',
            '(', workerMessageStr, ')()'
        ], { type: 'application/javascript' });
        let blobURL = URL.createObjectURL(blob);

        let worker = new Worker(blobURL);
        worker._listeners = component._listeners;
        worker._componentId = component.id;
        this.workers.push(worker);

        worker.addEventListener('message', this.workerMessageEvent.bind(this), false);

        URL.revokeObjectURL(blobURL);
    }
});

module.exports = ComponentManager;
