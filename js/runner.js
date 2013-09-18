function RunnerModel(position) {
    if(position) {
        this.position = position;
    } else {
        this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    }
    this.angle = randomInt(0, 360);
    this.size = 25;
    this.colour = {r:randomInt(0,255), g:randomInt(0,255), b:randomInt(0,255)};
    this.speed = randomInt(2,5);
}

function RunnerView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

RunnerView.prototype = {
    render: function() {
        this.context.lineWidth = 2;
        this.context.save();
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.fillStyle = rgbObjToHexColourString(this.model.colour);
        this.context.rotate(degToRad(this.model.angle));
        this.context.fillRect(-this.model.size/2, -this.model.size/2, this.model.size, this.model.size);
        this.context.rect(-this.model.size/2, -this.model.size/2, this.model.size, this.model.size);
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(this.model.size/2, 0);
        this.context.stroke();
        this.context.restore();
    }
}

function RunnerController(model) {
    this.model = model;
    this.view = new RunnerView(model, game.canvas.getContext('2d'));
    game.on('update', this.update, this);
}

RunnerController.prototype = {
    update:function() {
        this.advance(this.model.speed);
        if(this.model.position.x  > game.width + this.model.size) this.model.position.x = -this.model.size;
        if(this.model.position.x < -this.model.size) this.model.position.x = game.width + this.model.size;
        if(this.model.position.y > game.height + this.model.size) this.model.position.y = -this.model.size;
        if(this.model.position.y < -this.model.size) this.model.position.y = game.height + this.model.size;
    },
    advance:function(speed) {
        this.model.position.x += speed * Math.cos(degToRad(this.model.angle));
        this.model.position.y += speed * Math.sin(degToRad(this.model.angle));
    }
}