var langeroids = require('./langeroids.js');
var _ = langeroids._;
var io = require('socket.io-client');

var Network = require('./Network.js');

var defaults = {
    IP: 'localhost',
    PORT: 5493
};

var NetworkClient = module.exports = function(settings) {
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

    socketEmitSnapshotDiff: function(snapshotDiff) {
        this.socket.emit('snapshotDiff', snapshotDiff);
    }
});