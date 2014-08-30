var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    id: 'component-manager',
    initialized: false
};

var ComponentManager = module.exports = function(settings) {
    _.extend(this, defaults, settings);

    this.setMaxListeners(0);
    this.components = [];
    this.componentsMap = {};
    this.workers = [];
};

langeroids.inherits(ComponentManager, langeroids.EventEmitter);
var Parent = ComponentManager.super_;

_.extend(ComponentManager.prototype, {
    emit: function(type, args, transferables, callerId) {
        Parent.prototype.emit.apply(this, [ type, args, callerId ]);

        // emit to workers
        if (!_.isArray(transferables)) transferables = [];
        var workerArgs = args;
        for (var i = 0; i < this.workers.length; i++) {
            var worker = this.workers[i];
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

        var components = this.components;
        for (var i = 0; i < components.length; i++) {
            if (!components[i].useConcurrency) {
                langeroids.setComponentListeners(this, components[i], true);
            }
        }

        this.emit('init', this, null, this.id);
        this.initialized = true;
    },

    add: function(component) {
        langeroids.findComponentListeners(component);

        var self = this;
        component.emit = function(type, args, transferables) {
            self.emit.apply(self, [ type, args, transferables, this.id ])
        };

        this.components.push(component);
        if (_.isString(component.id)) this.componentsMap[component.id] = component;

        if (component.useConcurrency) {
            this.createWorker(component);
        }

        if (this.initialized) this.init();
    },

    sort: function() {
        this.components = _.sortBy(this.components, 'sortIndex');
    },

    getById: function(component) {
        if (_.isString(component)) {
            return this.componentsMap[component];
        }
        return false;
    },

    workerMessageEvent: function(event) {
        this.emit(event.data.type, event.data.args, null, event.target._componentId);
    },

    createWorker: function(component) {
        component = (_.isString(component)) ? this.componentsMap[component] : component;

        // convert component members (properties, functions) to strings
        var prototypeStr = 'Class.prototype.';
        var members = [];
        _.each(_.keys(component), function(value) {
            if (_.isFunction(component[value])) {
                members.push(prototypeStr + value + '=' + component[value].toString());
            }
            else {
                members.push(prototypeStr + value + '=' + JSON.stringify(component[value]));
            }
        });

        // create worker message events
        var workerMessageStr = function() {
            var component = new Class();
            component.emit = function(type, args, transferables) {
                self.postMessage({ type: type, args: args }, transferables);
            };
            self.addEventListener('message', function(event) {
                var type = event.data.type;
                type = 'on' + type.charAt(0).toUpperCase() + type.slice(1);
                // TODO: include once
                if (typeof component[type] === 'function') component[type](event.data.args, event.data.callerId);
            }, false);
        }.toString();

        // create final BLOB
        var blob = new Blob([
            'var Class = function() {};',
            members.join(';'), ';',
            '(', workerMessageStr, ')()'
        ], { type: 'application/javascript' });
        var blobURL = URL.createObjectURL(blob);

        var worker = new Worker(blobURL);
        worker._listeners = component._listeners;
        worker._componentId = component.id;
        this.workers.push(worker);

        worker.addEventListener('message', this.workerMessageEvent.bind(this), false);

        URL.revokeObjectURL(blobURL);
    }
});