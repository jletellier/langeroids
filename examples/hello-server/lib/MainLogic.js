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
        this.player = [];
    },

    onNetworkSerialize: function(refSnapshot) {
        if (this.game.isServer) {
            refSnapshot[this.id] = {
                player: _.clone(this.player)
            };
        }
    },

    onNetworkUnserialize: function(snapshotDiff) {
        if (!this.game.isServer) {
            _.extend(this, snapshotDiff[this.id]);
        }
    },

    onNetworkConnect: function(connectionId) {
        if (this.game.isServer) {
            var newPlayer = {
                id: connectionId,
                pos: {
                    x: _.random(0, this.WIDTH - this.PLAYER_RADIUS * 2),
                    y: _.random(0, this.HEIGHT - this.PLAYER_RADIUS * 2)
                },
                color: 'rgba('
            };
            for (var i = 0; i < 3; i++) newPlayer.color += _.random(20, 255) + ',';
            newPlayer.color += '0.7)';

            this.player.push(newPlayer);
        }
    },

    onNetworkDisconnect: function(connectionId) {
        if (this.game.isServer) {
            this.player = _.without(this.player, _.findWhere(this.player, { id: connectionId }));
        }
    },

    onDraw: function(renderer) {
        var ctx = renderer.ctx;
        renderer.clear();
        for (var i = 0; i < this.player.length; i++) {
            var player = this.player[i];
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.pos.x + this.PLAYER_RADIUS, player.pos.y + this.PLAYER_RADIUS, this.PLAYER_RADIUS, 0, 2 * Math.PI, true);
            ctx.fill();
        }
    }
});