function RunnerModel(position) {
    this.gene = {
        pathConfidence: Math.random(),
        angleConfidence: Math.random(),
        speedConfidence: (Math.random() / 2) + 0.5,
        size: randomInt(10, 20),
        senseRadius: randomInt(0, 100)
    };
    if(position) {
        this.position = position;
    } else {
        this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    }
    this.angle = randomInt(0, 360);
    this.colour = {r:randomInt(0,255), g:randomInt(0,255), b:randomInt(0,255)};
    this.sizeMultiple = 2 * this.gene.size / 10;
    this.gene.speed = this.sizeMultiple * this.gene.speedConfidence;
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
        
        this.context.rotate(degToRad(this.model.angle));
        
        this.context.fillStyle = rgbObjToHexColourString(this.model.colour);
    
        
        this.context.fillRect(-this.model.gene.size/2, -this.model.gene.size/2, this.model.gene.size, this.model.gene.size);
        this.context.rect(-this.model.gene.size/2, -this.model.gene.size/2, this.model.gene.size, this.model.gene.size);
        
        this.context.strokeWidth = this.sizeMultiple;
        this.context.strokeStyle = this.model.selected ? rgbObjToHexColourString({r:255, g:0, b:255}) : "#000000";
        this.context.beginPath();
        var size = this.model.gene.size/2;
        this.context.moveTo(size/2, size/3);
        this.context.lineTo(size - (size/10), size/3);
        this.context.stroke();
        this.context.beginPath();
        this.context.moveTo(size/2, -size/3);
        this.context.lineTo(size - (size/10), -size/3);
        this.context.stroke();
        this.context.closePath();
        this.context.strokeStyle = "#000000";
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
        if(Math.random() > this.model.gene.pathConfidence) {
            var angleChange = mapValue(this.model.gene.angleConfidence, 0, 1, 30, 0);
            this.model.angle += randomInt(-angleChange, angleChange);
        }
        this.advance(this.model.gene.speed);
        
        if(this.model.position.x  > game.width + this.model.gene.size) this.model.position.x = -this.model.gene.size;
        if(this.model.position.x < -this.model.gene.size) this.model.position.x = game.width + this.model.gene.size;
        if(this.model.position.y > game.height + this.model.gene.size) this.model.position.y = -this.model.gene.size;
        if(this.model.position.y < -this.model.gene.size) this.model.position.y = game.height + this.model.gene.size;
    },
    advance:function(speed) {
        this.model.position.x += speed * Math.cos(degToRad(this.model.angle));
        this.model.position.y += speed * Math.sin(degToRad(this.model.angle));
    }
}