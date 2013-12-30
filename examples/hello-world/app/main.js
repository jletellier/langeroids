var _ = require('underscore');
var Game = require('langeroids/lib/Game.js');
var Canvas2dRenderer = require('langeroids/lib/Canvas2dRenderer.js');

(function() {
    var game = new Game();

    game.addComponent(new Canvas2dRenderer({
        canvas: 'canvas'
    }));

    game.addComponent({
        init: function() {},
        update: function() {},
        draw: function(game, renderer) {
            renderer.clear();
            renderer.drawText(10, 15, 'Hello, World!')
        }
    });

    game.start();
})();