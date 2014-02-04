var langeroids = require('./langeroids.js');
var _ = require('underscore');
var io = require('socket.io');

var Network = require('./Network.js');

var defaults = {
    PORT: 5493
};

var NetworkServer = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

langeroids.inherits(NetworkServer, Network);

_.extend(NetworkServer.prototype, {
    init: function(game) {
        NetworkServer.super_.prototype.init.call(this, game);

        this.io = io.listen(this.PORT);
        this.io.on('connection', this.onConnection.bind(this));
        this.io.on('snapshotDiff', this.onSnapshotDiff.bind(this));
    },

    emitSnapshotDiff: function(snapshotDiff) {
        this.io.sockets.emit('snapshotDiff', snapshotDiff);
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
    }
});