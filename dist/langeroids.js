(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var langeroids = window.langeroids = require('./lib/langeroids');
langeroids._ = window._;

if (!langeroids._ || !langeroids._.extend) {
    console.error('Langeroids requires Underscore/Lo-Dash to function properly. Please add one of the libraries *before* you add Langeroids.');
}

langeroids.ComponentManager = require('./lib/component-manager');
langeroids.EntityManager = require('./lib/entity-manager');
langeroids.EventLogger = require('./lib/event-logger');
langeroids.AnimationLoop = require('./lib/animation-loop');
langeroids.Timer = require('./lib/timer');
},{"./lib/animation-loop":2,"./lib/component-manager":3,"./lib/entity-manager":4,"./lib/event-logger":5,"./lib/langeroids":6,"./lib/timer":7}],2:[function(require,module,exports){
var langeroids = require('./langeroids');
var _ = langeroids._;
var Timer = require('./timer');

var defaults = {
    id: 'animation-loop',
    autoStart: true,
    time: null,
    elapsed: 0
};

var AnimationLoop = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(AnimationLoop.prototype, {
    start: function() {
        this.startLoop();
    },

    startLoop: function() {
        var self = this;
        function animationLoop(time) {
            self.requestId = requestAnimationFrame(animationLoop);
            self.elapsed = time - self.time;
            self.time = time;
            if (self.elapsed > 0) self.run();
        }
        this.requestId = requestAnimationFrame(animationLoop);
    },

    stop: function() {
        cancelAnimationFrame(this.requestId);
    },

    run: function() {
        this.emit('update');
    },

    onInit: function(cm) {
        this.cm = cm;
        if (this.autoStart) this.start();
    },

    getTimer: function(settings) {
        return new Timer(settings, this);
    }
});
},{"./langeroids":6,"./timer":7}],3:[function(require,module,exports){
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

        this.setComponentMethods(component);

        this.components.push(component);
        if (_.isString(component.id)) this.componentsMap[component.id] = component;

        if (component.useConcurrency) {
            this.createWorker(component);
        }

        if (this.initialized) this.init();
    },

    setComponentMethods: function(component) {
        var self = this;
        if (!(component instanceof langeroids.EventEmitter)) {
            component.emit = function(type, args, transferables) {
                self.emit.apply(self, [ type, args, transferables, this.id ]);
            };
        }
        component.getComponent = function(id) {
            return self.getById(id);
        };
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
},{"./langeroids":6}],4:[function(require,module,exports){
var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    id: 'entity-manager',
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

    onInit: function() {
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
                    langeroids.removeComponentListeners(self, entity);
                }
                return (!entity.killed);
            });
        }
    },

    setEntityMethods: function(entity) {
        var self = this;
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
        if (this.initialized && _.isFunction(entity.onInit)) entity.onInit();
    },

    sort: function() {
        this.entities = _.sortBy(this.entities, 'sortIndex');
        // TODO: sort event listener
    }
});
},{"./langeroids":6}],5:[function(require,module,exports){
var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    id: 'event-logger',
    console: false,
    excludedEvents: []
};

var EventLogger = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(EventLogger.prototype, {
    onDefault: function(event, args, callerId) {
        if (this.console) {
            if (_.indexOf(this.excludedEvents, event) === -1) {
                console.log('Event: "' + event + '" from "' + callerId + '"', args);
            }
        }
    }
});
},{"./langeroids":6}],6:[function(require,module,exports){
(function (global){
// Set root to the global context (window in the browser)
var root = global;

// This is just for convenience
exports = module.exports = {
    _: {},
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
    var _ = exports._;
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
    var _ = exports._;
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
    var _ = exports._;
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
    var _ = exports._;
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"events":8,"inherits":9}],7:[function(require,module,exports){
var langeroids = require('./langeroids');
var _ = langeroids._;

var defaults = {
    animationLoop: null,
    tStart: null,
    tDuration: 0
};

var Timer = module.exports = function(settings, animationLoop) {
    _.extend(this, defaults);
    if (!_.isUndefined(animationLoop)) this.animationLoop = animationLoop;

    if (_.isObject(settings)) _.extend(this, settings);
    else if (_.isNumber(settings)) this.set(settings);
};

_.extend(Timer.prototype, {
    set: function(duration) {
        this.tStart = this.animationLoop.time;
        this.tDuration = duration || this.tDuration;
    },

    remaining: function() {
        return this.tDuration - (this.animationLoop.time - this.tStart);
    },

    repeat: function() {
        this.tStart = this.animationLoop.time;
    },

    done: function(repeat) {
        var done = (this.remaining() <= 0);
        if (done && repeat) this.repeat();
        return done;
    }
});
},{"./langeroids":6}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],9:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}]},{},[1]);
