var langeroids = require('langeroids');
var _ = langeroids._;

var defaults = {
    id: 'renderer',
    sortIndex: 9999,

    width: 300,
    height: 100,
    scale: 1
};

var Canvas2dRenderer = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(Canvas2dRenderer.prototype, {
    onInit: function() {
        if (_.isString(this.canvas)) {
            this.canvas = document.getElementById(this.canvas);
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    },

    onUpdate: function() {
        this.emit('draw', this);
    },

    resize: function(width, height, scale) {
        this.scale = scale || this.scale;
        this.realWidth = (width || this.width) * this.scale;
        this.realHeight = (height || this.height) * this.scale;
        this.canvas.width = this.realWidth;
        this.canvas.height = this.realHeight;
    },

    clear: function(fillStyle) {
        this.ctx.restore();
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);

        this.ctx.fillStyle = fillStyle || 'rgb(0, 0, 0)';
        this.ctx.fillRect(0, 0, this.realWidth, this.realHeight);
    },

    drawText: function(posX, posY, text) {
        this.ctx.fillStyle = 'rgb(255, 255, 255)';

        this.ctx.save();
        this.ctx.scale(2, 2);
        this.ctx.fillText(text, posX, posY);
        this.ctx.restore();
    }
});