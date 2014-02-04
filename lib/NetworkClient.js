var langeroids = require('./langeroids.js');
var _ = require('underscore');
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
    init: function(game) {
        NetworkClient.super_.prototype.init.call(this, game);

        this.socket = io.connect('http://' + this.IP + ':' + this.PORT);
        this.socket.on('snapshotDiff', this.onSnapshotDiff.bind(this));
    },

    emitSnapshotDiff: function(snapshotDiff) {
        this.socket.emit('snapshotDiff', snapshotDiff);
    }
});