var langeroids = require('./langeroids.js');
var _ = langeroids._;
var io = require('socket.io');

var Network = require('./network.js');

var defaults = {
    PORT: 5493
};

var NetworkServer = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

langeroids.inherits(NetworkServer, Network);

_.extend(NetworkServer.prototype, {
    onInit: function(game) {
        NetworkServer.super_.prototype.onInit.call(this, game);

        this.io = io.listen(this.PORT);
        this.io.on('connection', this.socketOnConnect.bind(this));
        this.io.on('snapshotDiff', this.socketEmitSnapshotDiff.bind(this));
    },

    socketEmitSnapshotDiff: function(snapshotDiff) {
        this.io.sockets.emit('snapshotDiff', snapshotDiff);
    }
});