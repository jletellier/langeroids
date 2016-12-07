var langeroids = require('./langeroids');
var _ = langeroids._;
var io = require('socket.io-client');

var Network = require('./network');

var defaults = {
    IP: 'localhost',
    PORT: 5493
};

/**
 * @deprecated
 */
var NetworkClient = module.exports = function(settings) {
    NetworkClient.super_.call(this, settings);
    _.extend(this, defaults, settings);
};

langeroids.inherits(NetworkClient, Network);

_.extend(NetworkClient.prototype, {
    onInit: function(game) {
        NetworkClient.super_.prototype.onInit.call(this, game);

        this.socket = io.connect('http://' + this.IP + ':' + this.PORT);
        this.socket.on('connect', this.socketOnConnect.bind(this));
        this.socket.on('snapshotDiff', this.socketOnSnapshotDiff.bind(this));
    },

    socketOnConnect: function(socket) {
        NetworkClient.super_.prototype.socketOnConnect.call(this, socket);

        this.sessionid = this.socket.socket.sessionid;
    },

    socketEmitSnapshotDiff: function(snapshotDiff) {
        if (!_.isEqual(snapshotDiff, this.lastReceivedSnapshot)) {
            this.socket.emit('snapshotDiff', snapshotDiff);
        }
    }
});