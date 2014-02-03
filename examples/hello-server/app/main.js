var Game = require('langeroids/lib/Game.js');
var Canvas2dRenderer = require('langeroids/lib/Canvas2dRenderer.js');
var NetworkClient = require('langeroids/lib/NetworkClient.js');

var MainLogic = require('../lib/MainLogic.js');

(function() {
    var game = new Game();

    game.addComponent(new Canvas2dRenderer({
        canvas: 'canvas',
        width: 450,
        height: 300
    }));

    game.addComponent(new MainLogic());

    game.addComponent(new NetworkClient({
        IP: 'localhost',
        PORT: 5493
    }));

    game.start();
})();