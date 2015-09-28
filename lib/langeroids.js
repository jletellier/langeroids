'use strict';

/*
 * Warning: On older browsers the following methods might need a polyfill:
 * - Object.assign
 * - Object.keys
 * - Array.prototype.forEach
 */

// Set root to the global context (window in the browser)
var root = global;

// This is just for convenience
var langeroids = {
    inherits: require('inherits'),
    EventEmitter: require('events').EventEmitter,

    browser: (typeof window !== 'undefined' && root === window)
};

langeroids.isArray = function(obj) {
    return (Object.prototype.toString.call(obj) === '[object Array]');
};

langeroids.isString = function(obj) {
    return (typeof obj === 'string' || obj instanceof String);
};

langeroids.createComponent = function(defaults, proto, stat, constructor, Parent) {
    var hasParent = typeof Parent === 'function';
    var Component = (typeof constructor === 'function') ?
        constructor :
        function(settings) {
            if (hasParent) Parent.call(this, settings);
            Object.assign(this, defaults, settings);
        };
    if (hasParent) langeroids.inherits(Component, Parent);
    Object.assign(Component.prototype, proto);
    Object.assign(Component, stat);
    return Component;
};

langeroids.findComponentListeners = function(component) {
    var listeners = component._listeners = {};
    var onceListeners = component._onceListeners = {};

    for (var value in component) {
        if (typeof component[value] === 'function') {
            if (value.indexOf('on', 0) === 0) {
                var once = (value.indexOf('once', 0) === 0);
                var type = value.substr(once ? 4 : 2);
                if (type.length > 0) {
                    type = type.substr(0, 1).toLowerCase() + type.substr(1);
                    listeners[type] = true;
                    if (once) onceListeners[type] = true;
                }
            }
        }
    }
};

langeroids.setComponentListeners = function(parent, component, force) {
    var listeners = component._listeners;
    var onceListeners = component._onceListeners;

    for (var key in listeners) {
        if (listeners.hasOwnProperty(key)) {
            var value = listeners[key];
            if ((force && value) || value === true) {
                var fnPrefix = onceListeners[key] ? 'once' : 'on';
                var fnName = fnPrefix + key.substr(0, 1).toUpperCase() + key.substr(1);
                var boundListener = component[fnName].bind(component);
                listeners[key] = boundListener;
                parent[fnPrefix](key, boundListener);
            }
        }
    }
};

langeroids.removeComponentListeners = function(parent, component, types) {
    var listeners = component._listeners;
    types = types || Object.keys(component._listeners);
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (listeners[type]) {
            parent.removeListener(types[i], listeners[type]);
            listeners[type] = true;
        }
    }
};

module.exports = langeroids;
