// Set root to the global context (window in the browser)
var root = global;

// Using lodash instead of underscore to minimize file size
var _ = require('lodash');

// This is just for convenience
exports = module.exports = {
    _: _,
    inherits: require('inherits'),
    EventEmitter: require('events').EventEmitter,

    browser: (typeof window !== 'undefined' && root === window)
};

// Parse the user agent in the browser
if (exports.browser) {
    var ua = navigator.userAgent.toLowerCase();
    var device = {
        iphone: /iphone/.test(ua),
        ipod: /ipod/.test(ua),
        ipad: /ipad/.test(ua),
        android: /android/.test(ua),
        blackberry: /blackberry/.test(ua),
        nexus7: /nexus 7/.test(ua),
        windowsPhone: /windows phone/.test(ua)
    };
    device.ios = device.iphone || device.ipod || device.ipad;
    device.mobile = device.ios || device.android || device.blackberry || device.windowsPhone;
    exports.device = device;
}

// Polyfill for requestAnimationFrame in the browser
// Copied from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
    var lastTime = 0;
    if (exports.browser) {
        var vendors = ['webkit', 'moz'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame =
                window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
    }

    if (!root.requestAnimationFrame)
        root.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = root.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!root.cancelAnimationFrame)
        root.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

exports.createComponent = function(defaults, proto, stat, constructor, Parent) {
    var hasParent = _.isFunction(Parent);
    var Component = _.isFunction(constructor) ?
        constructor :
        function(settings) {
            if (hasParent) Parent.call(this, settings);
            _.assign(this, defaults, settings);
        };
    if (hasParent) exports.inherits(Component, Parent);
    _.assign(Component.prototype, proto);
    _.assign(Component, stat);
    return Component;
};

exports.findComponentListeners = function(component) {
    var listeners = component._listeners = {};
    var onceListeners = component._onceListeners = {};
    _.forEach(_.functions(component), function(value) {
        if (value.indexOf('on', 0) === 0) {
            var once = (value.indexOf('once', 0) === 0);
            var type = value.substr(once ? 4 : 2);
            if (type.length > 0) {
                type = type.substr(0, 1).toLowerCase() + type.substr(1);
                listeners[type] = true;
                if (once) onceListeners[type] = true;
            }
        }
    });
};

exports.setComponentListeners = function(parent, component, force) {
    var listeners = component._listeners;
    var onceListeners = component._onceListeners;
    _.forEach(listeners, function(value, key) {
        if ((force && value) || value === true) {
            var fnPrefix = onceListeners[key] ? 'once' : 'on';
            var fnName = fnPrefix + key.substr(0, 1).toUpperCase() + key.substr(1);
            var boundListener = component[fnName].bind(component);
            listeners[key] = boundListener;
            parent[fnPrefix](key, boundListener);
        }
    });
};

exports.removeComponentListeners = function(parent, component, types) {
    var listeners = component._listeners;
    types = types || _.keys(component._listeners);
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (listeners[type]) {
            parent.removeListener(types[i], listeners[type]);
            listeners[type] = true;
        }
    }
};