var langeroids = require('langeroids/lib/langeroids.js');
var _ = langeroids._;

var defaults = {
    id: 'mainLogic',

    WIDTH: 450,
    HEIGHT: 300,
    PLAYER_RADIUS: 20
};

var MainLogic = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(MainLogic.prototype, {
    onInit: function(game) {
        this.game = game;
        this.player = {};

        if (!this.game.isServer) {
            this.network = game.getComponent('network');
            this.ownPlayer = null;
        }
    },

    onLastInputPosChanged: function(lastPosX, lastPosY) {
        if (this.ownPlayer) {
            this.ownPlayer.posX = lastPosX - this.PLAYER_RADIUS;
            this.ownPlayer.posY = lastPosY - this.PLAYER_RADIUS;
        }
    },

    onNetworkSerialize: function(refSnapshot) {
        if (this.game.isServer) {
            var self = this;
            _.each(this.player, function(item) {
                refSnapshot[item.id] = _.clone(item);
                if (item._removed) delete self.player[item.id];
            });
        }
        else {
            if (this.ownPlayer) {
                refSnapshot[this.ownPlayer.id] = _.clone(this.ownPlayer);
            }
        }
    },

    onNetworkUnserialize: function(snapshotDiff) {
        var self = this;
        if (this.game.isServer) {
            _.each(snapshotDiff, function(item, key) {
                _.extend(self.player[key], item);
            });
        }
        else {
            _.each(snapshotDiff, function(item, key) {
                if (!self.player[key]) self.player[key] = {};
                _.extend(self.player[key], item);
                if (key === self.network.sessionid) self.ownPlayer = self.player[key];
                if (self.player[key]._removed) delete self.player[key];
            });
        }
    },

    onNetworkConnect: function(connectionId) {
        if (this.game.isServer) {
            var newPlayer = {
                id: connectionId,
                posX: _.random(0, this.WIDTH - this.PLAYER_RADIUS * 2),
                posY: _.random(0, this.HEIGHT - this.PLAYER_RADIUS * 2),
                color: 'rgba('
            };
            for (var i = 0; i < 3; i++) newPlayer.color += _.random(20, 255) + ',';
            newPlayer.color += '0.7)';

            this.player[connectionId] = newPlayer;
        }
        else {
            this.player = {};
        }
    },

    onNetworkDisconnect: function(connectionId) {
        if (this.game.isServer) {
            this.player[connectionId]._removed = true;
        }
    },

    onDraw: function(renderer) {
        var ctx = renderer.ctx;
        renderer.clear();
        var self = this;
        _.each(this.player, function(player) {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.posX + self.PLAYER_RADIUS, player.posY + self.PLAYER_RADIUS, self.PLAYER_RADIUS, 0, 2 * Math.PI, true);
            ctx.fill();
        });
    }
});