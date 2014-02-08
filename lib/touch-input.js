var langeroids = require('./langeroids.js');
var _ = langeroids._;

var defaults = {
    lastPosX: -1,
    lastPosY: -1
};

var TouchInput = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(TouchInput.prototype, {
    onInit: function(game) {
        this.game = game;
        this.scale = 1;
        //this.scale = game.renderer.scale;

        document.addEventListener('mousedown', this.mousedown.bind(this), false);
        document.addEventListener('mouseup', this.mouseup.bind(this), false);
        document.addEventListener('touchstart', this.touchstart.bind(this), false);
        document.addEventListener('touchmove', this.touchmove.bind(this), false);
        document.addEventListener('touchend', this.touchend.bind(this), false);
    },

    onUpdate: function() {
        if (this.lastPosX >= 0) {
            this.game.emit('lastInputPosChanged', this.lastPosX, this.lastPosY);
            this.lastPosX = -1;
        }
    },

    pointInArea: function(area, x, y) {
        return ((x >= area.x1 && x <= area.x2) && (y >= area.y1 && y <= area.y2));
    },

    mousedown: function(e) {
        this.lastPosX = e.pageX / this.scale;
        this.lastPosY = e.pageY / this.scale;
    },

    mouseup: function(e) {

    },

    touchstart: function(e) {
        e.preventDefault();

        for (var i = 0; i < e.touches.length; i++) {
            var touch = e.touches[i];
            this.lastPosX = touch.pageX / this.scale;
            this.lastPosY = touch.pageY / this.scale;
        }
    },

    touchmove: function(e) {
        e.preventDefault();
    },

    touchend: function(e) {
        e.preventDefault();
    }
});