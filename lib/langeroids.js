'use strict';

/*
 * Warning: On older browsers the following methods might need a polyfill:
 * - Object.assign
 * - Object.keys
 * - Array.prototype.forEach
 */

// Set root to the global context (window in the browser)
let root = global;

// This is just for convenience
let langeroids = {
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
    let hasParent = typeof Parent === 'function';
    let Component = (typeof constructor === 'function') ?
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
    let listeners = component._listeners = {};
    let onceListeners = component._onceListeners = {};

    for (let value in component) {
        if (typeof component[value] === 'function') {
            if (value.indexOf('on', 0) === 0) {
                let once = (value.indexOf('once', 0) === 0);
                let type = value.substr(once ? 4 : 2);
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
    let listeners = component._listeners;
    let onceListeners = component._onceListeners;

    for (let key in listeners) {
        if (listeners.hasOwnProperty(key)) {
            let value = listeners[key];
            if ((force && value) || value === true) {
                let fnPrefix = onceListeners[key] ? 'once' : 'on';
                let fnName = fnPrefix + key.substr(0, 1).toUpperCase() + key.substr(1);
                let boundListener = component[fnName].bind(component);
                listeners[key] = boundListener;
                parent[fnPrefix](key, boundListener);
            }
        }
    }
};

langeroids.removeComponentListeners = function(parent, component, types) {
    let listeners = component._listeners;
    types = types || Object.keys(component._listeners);
    for (let i = 0; i < types.length; i++) {
        let type = types[i];
        if (listeners[type]) {
            parent.removeListener(types[i], listeners[type]);
            listeners[type] = true;
        }
    }
};

module.exports = langeroids;
