var langeroids = window.langeroids = require('./lib/langeroids');

if (!Object.assign) {
    console.error(
        'Langeroids requires the ECMAScript 2015 (ES6) feature "Object.assign" to function. ' +
        'Please provide a polyfill or use a supported browser: http://browsehappy.com/'
    );
}

langeroids.ComponentManager = require('./lib/component-manager');
langeroids.EntityManager = require('./lib/entity-manager');
langeroids.EventLogger = require('./lib/event-logger');
langeroids.AnimationLoop = require('./lib/animation-loop');
langeroids.Timer = require('./lib/timer');
