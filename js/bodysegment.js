/*
* Model
*/
function SegmentModel(size, baseColour, stripy, startPosition) {
    this.size = size;
    this.colour = baseColour;
    this.stripy = stripy;
    this.moveDecisions = [];
    this.position = startPosition.copy();
    this.lastPosition = startPosition.copy();
    this.velocity = new Vector(0, 0);
    this.points = {
        front:this.position.copy(), 
        back:this.position.copy(), 
        left:this.position.copy(), 
        right:this.position.copy()
    };
}

/*
* View
*/
SegmentView = function(model, context) {
    console.log("SegmentView")
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

SegmentView.prototype = {
    
    render: function() {        
        
        this.context.save();
        
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.rotate(degToRad(this.model.velocity.toAngle()));
        
        this.context.fillStyle = this.model.colour;
        this.context.fillRect(-this.model.size/2, -this.model.size/2, this.model.size, this.model.size);
        /*this.context.beginPath();
        this.context.arc(0, 0, this.model.size/2, 0, degToRad(360));
        this.context.globalAlpha = 0.2;
        this.context.fill();
        this.context.closePath();
        this.context.globalAlpha = 1;*/
        this.context.restore();
        
        /*this.context.beginPath();
        this.context.moveTo(this.model.points.left.x, this.model.points.left.y);
        this.context.lineTo(this.model.points.right.x, this.model.points.right.y);
        this.context.moveTo(this.model.points.front.x, this.model.points.front.y);
        this.context.lineTo(this.model.points.back.x, this.model.points.back.y);
        this.context.stroke();
        this.context.closePath();*/
        
        
    }
}

/*
* Controller
*/
function SegmentController(model) {
    this.model = model;
    this.setRandomColour();
    this.view = new SegmentView(model, game.context);
    game.on('update', this.update, this);
}

SegmentController.prototype = {
    
    getTangent: function() {
        var tangent = this.model.velocity.toAngle();
        tangent = (360 + tangent + 45) % 360;
        return tangent;
    },
    
    setRandomColour: function() {
        this.model.stripiness = mapValue(this.model.stripy, 0, 1, 0, (Math.random() * 2) - 1);
        var brightnessModifier = parseInt(mapValue(this.model.stripiness, -1, 1, -100, 100));
        var newTailColour = brightenColour(this.model.colour, brightnessModifier);
        this.model.colour = rgbObjToHexColourString(newTailColour);
    },
    
    update: function() {
        this.model.velocity.x = this.model.position.x - this.model.lastPosition.x;
        this.model.velocity.y = this.model.position.y - this.model.lastPosition.y;
        
        var tangent  = this.getTangent(),
            pos = this.model.position.copy(),
            points = {};
        points.front = pos.add(pos.getRelativePosition(this.model.size * 0.5, this.model.velocity.toAngle()));
        points.back = pos.add(pos.getRelativePosition(-this.model.size * 0.5, this.model.velocity.toAngle()));
        points.left = pos.add(pos.getRelativePosition(-this.model.size * 0.5, tangent));
        points.right = pos.add(pos.getRelativePosition(this.model.size * 0.5, tangent));
        
        this.model.points = points;
        
        this.model.lastPosition = this.model.position.copy();
    }
}