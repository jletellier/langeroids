var langeroids = require('langeroids/lib/langeroids.js');
var _ = langeroids._;

var defaults = {
    radius: 4,
    width: 8,
    height: 8,
    forceX: 120,
    forceY: -240,
    color: '0,0,128',

    BULLET_OPACITY: 0.8
};

var BulletEntity = module.exports = function(settings) {
    _.extend(this, defaults, settings);
};

_.extend(BulletEntity.prototype, {
    onInit: function(game) {
        this.physics = game.getComponent('physics');
        this.createBody();

        this.body.ApplyForce(this.body.GetWorldVector(new this.physics.Box2D.b2Vec2(this.forceX, this.forceY)), this.body.GetWorldCenter());

        return this;
    },

    createBody: function() {
        var Box2D = this.physics.Box2D;

        // create shape
        var shape = new Box2D.b2CircleShape();
        shape.set_m_radius(this.radius * this.physics.b2scale);

        // create fixture
        var fd = new Box2D.b2FixtureDef();
        fd.set_shape(shape);

        fd.set_density(1);
        fd.set_friction(0.1);

        // create body and ...
        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_dynamicBody);
        bd.set_position(new Box2D.b2Vec2((this.posX + this.width / 2) * this.physics.b2scale, (this.posY + this.height / 2) * this.physics.b2scale));

        this.body = this.physics.world.CreateBody(bd);
        this.body.entity = this;

        // ...add fixture
        this.body.CreateFixture(fd);
    },

    onUpdate: function() {
        var p = this.body.GetPosition();
        this.posX = p.get_x() / this.physics.b2scale - this.width / 2;
        this.posY = p.get_y() / this.physics.b2scale - this.height / 2;
        //this.angle = this.body.GetAngle().toFixed(2);

        if (this.posY > 200) this.kill();
    },

    kill: function() {
        this.physics.world.DestroyBody(this.body);
        this.killed = true;
    },

    onDraw: function(renderer) {
        var ctx = renderer.ctx;

        // draw bullet
        ctx.fillStyle = 'rgba('+ this.color +','+ this.BULLET_OPACITY +')';
        ctx.beginPath();
        ctx.arc(this.posX + this.radius, this.posY + this.radius, this.radius, 0, 2 * Math.PI, true);
        ctx.fill();
    }
});