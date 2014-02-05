var langeroids = require('./langeroids.js');
var _ = langeroids._;

var Network = module.exports = function(settings) {
    _.extend(this, settings);
};

_.extend(Network.prototype, {
    onInit: function(game) {
        this.game = game;
        this.game.isServer = !langeroids.browser;
        this.prevSnapshot = {};
    },

    socketOnConnect: function(socket) {
        socket = socket || this.socket.socket;
        socket.on('disconnect', this.socketOnDisconnect.bind(this, socket));

        this.game.emit('networkConnect', socket.id || socket.sessionid);
    },

    socketOnDisconnect: function(socket) {
        this.game.emit('networkDisconnect', socket.id || socket.sessionid);
    },

    socketOnSnapshotDiff: function(snapshotDiff) {
        this.game.emit('networkUnserialize', snapshotDiff);
    },

    onUpdate: function() {
        var snapshot = {};
        this.game.emit('networkSerialize', snapshot);

        var snapshotDiff = this.getSnapshotDiff(snapshot, this.prevSnapshot);
        if (snapshotDiff) {
            this.socketEmitSnapshotDiff(snapshotDiff);
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
    }
});