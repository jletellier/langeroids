var _ = require('underscore');
var Game = require('langeroids/lib/Game.js');
var Box2dPhysics = require('langeroids/lib/Box2dPhysics.js');
var Canvas2dRenderer = require('langeroids/lib/Canvas2dRenderer.js');
var MainLogic = require('../lib/MainLogic.js');

(function() {
    var game = new Game();

    game.addComponent(new Box2dPhysics());

    game.addComponent(new Canvas2dRenderer({
        canvas: 'canvas',
        width: 900,
        height: 600
    }));

    game.addComponent(new MainLogic());

    game.start();
})();