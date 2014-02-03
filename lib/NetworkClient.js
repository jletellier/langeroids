var _ = require('underscore');
var io = require('socket.io-client');

var defaults = {
    IP: 'localhost',
    PORT: 5493
};

var NetworkClient = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(NetworkClient.prototype, {
    init: function(game) {
        this.game = game;
        this.socket = io.connect('http://' + this.IP + ':' + this.PORT);
        this.socket.on('snapshotDiff', this.onSnapshotDiff.bind(this));
    },

    onSnapshotDiff: function(snapshotDiff) {
        var game = this.game;
        _.each(snapshotDiff, function(value, key) {
            var component = game[key];
            if (_.isObject(component) && _.isFunction(component.networkUnserialize)) {
                component.networkUnserialize(value);
            }
        });
    },

    update: function() {},

    draw: function() {}
});