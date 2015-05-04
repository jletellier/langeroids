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