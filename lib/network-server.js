var langeroids = require('./langeroids');
var _ = langeroids._;
var io = require('socket.io');

var Network = require('./network');

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
    },

    socketOnConnect: function(socket) {
        NetworkServer.super_.prototype.socketOnConnect.call(this, socket);

        socket.on('snapshotDiff', this.socketOnSnapshotDiff.bind(this));

        // emit latest snapshot
        if (this.prevSnapshot) socket.emit('snapshotDiff', this.prevSnapshot);
    },

    socketEmitSnapshotDiff: function(snapshotDiff) {
        this.io.sockets.emit('snapshotDiff', snapshotDiff);
    }
});