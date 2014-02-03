var _ = require('underscore');
var io = require('socket.io');

var defaults = {
    PORT: 5493
};

var NetworkServer = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(NetworkServer.prototype, {
    init: function(game) {
        this.io = io.listen(this.PORT);
        this.io.on('connection', this.onConnection.bind(this));

        this.game = game;
        this.prevSnapshot = {};
    },

    onConnection: function(socket) {
        socket.on('disconnect', this.onDisconnect.bind(this, socket));

        for (var i = 0; i < this.game.components.length; i++) {
            var component = this.game.components[i];
            if (_.isFunction(component.networkConnect)) {
                component.networkConnect(socket.id);
            }
        }
    },

    onDisconnect: function(socket) {
        for (var i = 0; i < this.game.components.length; i++) {
            var component = this.game.components[i];
            if (_.isFunction(component.networkDisconnect)) {
                component.networkDisconnect(socket.id);
            }
        }
    },

    update: function() {
        var snapshot = {};
        for (var i = 0; i < this.game.components.length; i++) {
            var component = this.game.components[i];
            if (_.isFunction(component.networkSerialize) && _.isString(component.ID)) {
                var serializedData = component.networkSerialize();
                if (!_.isUndefined(serializedData)) {
                    snapshot[component.ID] = serializedData;
                }
            }
        }

        var snapshotDiff = this.getSnapshotDiff(snapshot, this.prevSnapshot);
        if (snapshotDiff) {
            this.io.sockets.emit('snapshotDiff', snapshotDiff);
        }

        this.prevSnapshot = snapshot;
    },

    getSnapshotDiff: function(current, prev) {
        var diffSnapshot = {};
        _.each(current, function(value, key) {
            if (!_.isEqual(value, prev[key])) {
                diffSnapshot[key] = value;
            }
        });

        if (!_.keys(diffSnapshot).length) return false;
        return diffSnapshot;
    },

    draw: function() {}
});