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