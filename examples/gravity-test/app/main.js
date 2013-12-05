var langeroids = require('langeroids/lib/langeroids.js');
var _ = require('underscore');
var Game = require('langeroids/lib/Game.js');

var GravityTestGame = function(settings) {
    GravityTestGame.super_.apply(this, arguments);
};

langeroids.inherits(GravityTestGame, Game);

_.extend(GravityTestGame.prototype, {
    update: function() {

    },

    draw: function() {

    }
});

var game = new GravityTestGame();
game.start();