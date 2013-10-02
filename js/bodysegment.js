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
        this.context.fillStyle = this.model.colour;
        
        this.context.save();
        
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.rotate(degToRad(this.model.velocity.toAngle()));
        
        this.context.fillRect(-this.model.size/2, -this.model.size/2, this.model.size, this.model.size);
        
        this.context.restore();
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
    
    setRandomColour: function() {
        this.model.stripiness = mapValue(this.model.stripy, 0, 1, 0, (Math.random() * 2) - 1);
        var brightnessModifier = parseInt(mapValue(this.model.stripiness, -1, 1, -100, 100));
        var newTailColour = brightenColour(this.model.colour, brightnessModifier);
        this.model.colour = rgbObjToHexColourString(newTailColour);
    },
    
    update: function() {
        this.model.velocity.x = this.model.position.x - this.model.lastPosition.x;
        this.model.velocity.y = this.model.position.y - this.model.lastPosition.y;
                
        this.model.lastPosition = this.model.position.copy();
    }
}