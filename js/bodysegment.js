<<<<<<< HEAD
function SegmentModel(index, size, baseColour, brightnessVariation) {
    this.index = index;
    this.size = size;
    this.colour = baseColour;
    this.brightnessVariation = brightnessVariation;
    this.moveDecisions = [];
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
}

function SegmentController(model, parent) {
    this.model = model;
    this.parentModel = parent;
    this.setRandomColour();
    this.inheritParentPosition();
    this.view = new SegmentView(model, game.context);
    game.on('update', this.update, this);
}

SegmentController.prototype = {
    
    advance: function() {
        this.model.position = this.model.position.add(this.model.velocity);
        if(this.nextDecisionReached()) {
            this.model.velocity = this.model.moveDecisions.shift().velocity;
        }
    },
    
    nextDecisionReached: function() {
        var decisionPosition = this.model.moveDecisions[0] ? this.model.moveDecisions[0].position : undefined,
            position = this.model.position,
            velocity = this.model.velocity;
        if(decisionPosition == undefined) return false;
        if(this.model.position.equalTo(this.model.moveDecisions[0].position)) {
            return true;
        } else {
            if(this.model.velocity.x < 0) {
                if(this.model.velocity.y < 0) {
                    // if position x < move decision x && move decision x < position x + velocity x
                    if(position.x < decisionPosition.x
                       && position.y < decisionPosition.y){
                        return true;
                    }
                } else {
                    if(position.x < decisionPosition.x
                       && position.y > decisionPosition.y){
                        return true;
                    }
                }
            } else {
                if(this.model.velocity.y < 0) {
                    if(position.x > decisionPosition.x
                       && position.y < decisionPosition.y){
                        return true;
                    }
                } else {
                    if(position.x > decisionPosition.x
                       && position.y > decisionPosition.y){
                        return true;
                    }
                }
            }            
        }
        return false;
    },
    
    inheritParentPosition: function() {
        var hyp = new Vector(this.model.size/2, this.model.size/2).mag();
        this.model.position = this.parentModel.velocity.getPositionBehind(hyp).add(this.parentModel.position);
        this.model.velocity = this.parentModel.velocity.copy();
    },
    
    onMoveDecisionMade: function(data) {
        this.model.moveDecisions.push({position:data.pos, velocity:data.vel});
    },
    
    setRandomColour: function() {
        this.model.brightnessVariation = mapValue(this.model.brightnessVariation, 0, 1, 0, (Math.random() * 2) - 1);
        var brightnessModifier = parseInt(mapValue(this.model.brightnessVariation, -1, 1, -100, 100)),
            newTailColour = brightenColour(this.model.colour, brightnessModifier);
        this.model.colour = rgbObjToHexColourString(newTailColour);
    },
    
    update: function() {
        this.advance();
    }
}

SegmentView = function(model, context) {
=======
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
>>>>>>> verlet
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

SegmentView.prototype = {
    
<<<<<<< HEAD
    render: function() {
        
=======
    render: function() {        
>>>>>>> verlet
        this.context.fillStyle = this.model.colour;
        
        this.context.save();
        
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.rotate(degToRad(this.model.velocity.toAngle()));
        
        this.context.fillRect(-this.model.size/2, -this.model.size/2, this.model.size, this.model.size);
        
        this.context.restore();
    }
<<<<<<< HEAD
=======
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
>>>>>>> verlet
}