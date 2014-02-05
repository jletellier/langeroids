// dev http server
var beefy = require('beefy');
var entry_points = { 'bundle.js': 'app/main.js' };
var server = beefy('app', 'browserify', [ '-d' ], entry_points, false);
server.listen(9966);

var Game = require('langeroids/lib/game.js');
var NetworkServer = require('langeroids/lib/network-server.js');

var MainLogic = require('./lib/main-logic.js');

(function() {
    var game = new Game();

    game.addComponent(new MainLogic());

    game.addComponent(new NetworkServer({
        PORT: 5493
    }));

    game.start();
})();