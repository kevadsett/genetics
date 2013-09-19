function BallModel(position) {
    if(position) {
        this.position = position;
    } else {
        this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    }
}

function BallView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

BallView.prototype = {
    render: function() {
        this.context.save();
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.fillStyle = "#FF0000";
        this.context.arc(0, 0, 10, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
    }
}

function BallController(model) {
    this.model = model;
    this.view = new BallView(model, game.context);
    game.on('update', this.update, this);
}

BallController.prototype = {
    update:function() {},
    moveTo:function(x, y) {
        this.model.position.x = x;
        this.model.position.y = y;
    }
}