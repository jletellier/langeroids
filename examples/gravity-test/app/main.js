var langeroids = require('langeroids/lib/langeroids.js');
var Game = require('langeroids/lib/Game.js');
var Box2dPhysics = require('langeroids/lib/Box2dPhysics.js');
var Canvas2dRenderer = require('langeroids/lib/Canvas2dRenderer.js');
var EntityManager = require('langeroids/lib/EntityManager.js');
var MainLogic = require('../lib/MainLogic.js');

(function() {
    var game = new Game();

    game.addComponent(new Box2dPhysics());

    game.addComponent(new Canvas2dRenderer({
        canvas: 'canvas',
        width: 300,
        height: 100,
        scale: 3
    }));

    game.addComponent(new MainLogic());

    game.addComponent(new EntityManager());

    game.start();
})();