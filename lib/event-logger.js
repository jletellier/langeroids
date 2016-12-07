'use strict';

let defaults = {
    id: 'event-logger',
    console: false,
    excludedEvents: []
};

let EventLogger = function(settings) {
    Object.assign(this, defaults, settings);
};

Object.assign(EventLogger.prototype, {
    onDefault: function(event, args, callerId) {
        if (this.console) {
            if (this.excludedEvents.indexOf(event) === -1) {
                console.log('Event: "' + event + '" from "' + callerId + '"', args);
            }
        }
    }
});

module.exports = EventLogger;
