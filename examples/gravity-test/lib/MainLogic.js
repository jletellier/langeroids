var langeroids = require('langeroids/lib/langeroids.js');
var _ = langeroids._;
var Timer = require('langeroids/lib/Timer.js');

var GroundEntity = require('./GroundEntity.js');
var BulletEntity = require('./BulletEntity.js');

var defaults = {
    BULLET_SPAWN_INTERVAL: 1800,
    BULLET_COLOR_CHANGE_INTERVAL: 8000,
    BULLET_COLORS: [ '30,144,255', '60,179,113', '218,165,32', '138,43,226', '205,0,0' ],
    BULLET_MIN_FORCE_X: 120,
    BULLET_MAX_FORCE_X: 320,
    BULLET_MIN_FORCE_Y: -240,
    BULLET_MAX_FORCE_Y: -400,

    currentBulletColor: 0
};

var MainLogic = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(MainLogic.prototype, {
    onInit: function(game) {
        this.em = game.getComponent('entityManager');
        this.em.add(new GroundEntity());

        // timers for generated entities
        this.bulletColorChangeTimer = new Timer({ game: game, tDuration: this.BULLET_COLOR_CHANGE_INTERVAL });
        this.bulletTimer = new Timer({ game: game, tDuration: this.BULLET_SPAWN_INTERVAL });
        this.bulletTimer2 = new Timer({ game: game, tDuration: this.BULLET_SPAWN_INTERVAL + 120 });

        this.currentBulletColor = _.random(4, this.BULLET_COLORS.length - 1);
    },

    onUpdate: function() {
        // change bullet color
        if (this.bulletColorChangeTimer.done()) {
            this.currentBulletColor = _.random(0, this.BULLET_COLORS.length - 1);
            this.bulletColorChangeTimer.repeat();
        }

        // throw bullets
        if (this.bulletTimer.done()) {
            this.em.add(new BulletEntity({
                posX: -5,
                posY: 50,
                forceX: _.random(this.BULLET_MIN_FORCE_X, this.BULLET_MAX_FORCE_X),
                forceY: _.random(this.BULLET_MIN_FORCE_Y, this.BULLET_MAX_FORCE_Y),
                color: this.BULLET_COLORS[this.currentBulletColor]
            }));

            this.bulletTimer.repeat();
        }
        if (this.bulletTimer2.done()) {
            this.em.add(new BulletEntity({
                posX: 305,
                posY: 70,
                forceX: _.random(-this.BULLET_MIN_FORCE_X, -this.BULLET_MAX_FORCE_X),
                forceY: _.random(this.BULLET_MIN_FORCE_Y, this.BULLET_MAX_FORCE_Y),
                color: this.BULLET_COLORS[this.currentBulletColor]
            }));

            this.bulletTimer2.repeat();
        }
    },

    onDraw: function(renderer) {
        renderer.clear('rgb(0,0,0)');
    }
});