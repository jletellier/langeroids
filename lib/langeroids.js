// Set root to the global context (window in the browser)
var root = global;

// This is just for convenience
exports = module.exports = {
    _: require('underscore'),
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

exports.setComponentListener = function(parent, component) {
    var _ = exports._;
    _.each(_.functions(component), function(value) {
        if (value.indexOf('on', 0) === 0) {
            var once = (value.indexOf('once', 0) === 0);
            var type = value.substr(once ? 4 : 2);
            if (type.length > 0) {
                type = type.substr(0, 1).toLowerCase() + type.substr(1);
                if (!_.isArray(component.listener)) component.listener = {};
                var boundListener = component[value].bind(component);
                component.listener[type] = boundListener;
                parent[once ? 'once' : 'on'](type, boundListener);
            }
        }
    });
};

exports.removeComponentListener = function(parent, component, listener) {
    var _ = exports._;
    listener = listener || _.keys(component.listener);
    for (var i = 0; i < listener.length; i++) {
        parent.removeListener(listener[i], component.listener[listener[i]]);
    }
};