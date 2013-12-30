var _ = require('underscore');
var Timer = require('langeroids/lib/Timer.js');
var Box2D = require('box2d.js').Box2D;

var defaults = {
    width: 230,
    height: 50,
    posX: 35,
    posY: 50,

    currentHColorDirection: -1,
    currentHColor: 0,
    colorChangeInterval: 100
};

var GroundEntity = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(GroundEntity.prototype, {
    init: function(game) {
        this.physics = game.physics;
        this.shapes = [];

        this.createBody();

        this.colorChangeTimer = new Timer({
            game: game,
            tDuration: this.colorChangeInterval
        });
    },

    createBody: function() {
        this.halfWidth = this.width / 2;
        this.halfHeight = this.height / 2;

        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_staticBody);
        bd.set_position(new Box2D.b2Vec2((this.posX + this.halfWidth) * this.physics.b2scale, (this.posY + this.halfHeight) * this.physics.b2scale));
        this.body = this.physics.world.CreateBody(bd);

        this.addBoxShape(-65, this.height / 2 - 5, 70, 10);
        this.addBoxShape(65, this.height / 2 - 5, 70, 10);
        this.addBoxShape(0, -(this.height / 2) + 3, 55, 5);
        this.addCircleShape(-100, this.height / 2 - 5, 14);
        this.addCircleShape(100, this.height / 2 - 5, 14);
    },

    addBoxShape: function(x, y, w, h) {
        var shape = new Box2D.b2PolygonShape();
        shape.SetAsBox(w / 2 * this.physics.b2scale, h / 2 * this.physics.b2scale, new Box2D.b2Vec2(x * this.physics.b2scale, y * this.physics.b2scale), 0);

        var fd = new Box2D.b2FixtureDef();
        fd.set_shape(shape);
        this.body.CreateFixture(fd);

        this.shapes.push({
            type: shape.GetType(),
            x: x + this.halfWidth - w / 2,
            y: y + this.halfHeight - h / 2,
            w: w,
            h: h
        });
    },

    addCircleShape: function(x, y, radius) {
        var shape = new Box2D.b2CircleShape();
        shape.set_m_p(new Box2D.b2Vec2(x * this.physics.b2scale, y * this.physics.b2scale));
        shape.set_m_radius(radius * this.physics.b2scale);

        var fd = new Box2D.b2FixtureDef();
        fd.set_shape(shape);
        this.body.CreateFixture(fd);

        this.shapes.push({
            type: shape.GetType(),
            x: x + this.halfWidth,
            y: y + this.halfHeight,
            radius: radius
        });
    },

    update: function() {
        if (this.colorChangeTimer.done()) {
            if (this.currentHColor == 360 || this.currentHColor == 0) this.currentHColorDirection *= -1;
            this.currentHColor += this.currentHColorDirection;
            this.colorChangeTimer.repeat();
        }
    },

    draw: function(game, renderer) {
        renderer.ctx.fillStyle = 'hsla('+ this.currentHColor +',61%,56%,0.5)';

        for (var i = 0; i < this.shapes.length; i++) {
            var shape = this.shapes[i];
            if (shape.type == 0) this.drawCircle(renderer, shape);
            else if (shape.type == 2) this.drawPolygon(renderer, shape);
        }
    },

    drawCircle: function(renderer, shape) {
        var ctx = renderer.ctx;

        ctx.beginPath();
        ctx.arc(this.posX + shape.x, this.posY + shape.y, shape.radius, 0, 2 * Math.PI, false);
        ctx.fill();
    },

    drawPolygon: function(renderer, shape) {
        var ctx = renderer.ctx;

        ctx.fillRect(this.posX + shape.x, this.posY + shape.y, shape.w, shape.h);
    }
});