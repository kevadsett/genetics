function RunnerModel() {
    this.genes = new dna({
    behaviour: new Chromosome(
        ["pathConfidence", 
         "angleConfidence", 
         "velocityConfidence", 
         "senseRadius",
         "caresAboutObjects",
         "objectAffectsVelocity",
         "velocityObjectEffect",
         "objectAffectsDirectionalBias",
         "directionalBiasObjectEffect",
         "objectAffectsVelocityConfidence",
         "velocityConfidenceObjectEffect",
         "objectAffectsAngleConfidence",
         "angleConfidenceObjectEffect",
         "objectAffectsPathConfidence",
         "pathConfidenceObjectEffect",
         "directionalBias",
         "velocityBias"
        ]),
     appearance: new Chromosome(
         ["tailLength", 
          "size",
          "colourVariation",
          "brightnessVariation",
          "red", 
          "green",
          "blue"
         ])
    });
}

function RunnerView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

RunnerView.prototype = {
    render: function() {
        this.context.lineWidth = 2;
        
        this.renderEyes(this.model.tail[0].model);
    },
    
    renderEyes: function(segment) {
        this.context.save();
        
        this.context.translate(segment.position.x, segment.position.y);
        
        this.context.rotate(degToRad(segment.velocity.toAngle()));
        
        this.context.strokeWidth = this.model.size / 10;
        this.context.strokeStyle = this.model.selected ? rgbObjToHexColourString({r:255, g:0, b:255}) : "#000000";
        this.context.beginPath();
        var size = this.model.size;
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
    Events(this);
    this.model = model;
    this.setupAttributes();
    this.view = new RunnerView(model, game.context);
    game.on('update', this.update, this);
}

RunnerController.prototype = {
    
    advance: function() {
        var speedChange = mapValue(this.model.velocityConfidence, 0, 1, randomInt(0, 2), 0);
        if (Math.random() > this.model.velocityBias) {
            speedChange = -speedChange;
        }
        this.model.position.add(this.model.velocity);
        this.checkForBoundaries();
    },
    
    checkForBoundaries: function() {
        if(this.model.position.x + this.model.velocity.x < 0 || this.model.position.x + this.model.velocity.x > game.width) {
            this.model.velocity.x = -this.model.velocity.x;
            this.emit("moveDecisionMade", {pos:this.model.position.copy(), vel:this.model.velocity.copy()});
        }
        if(this.model.position.y + this.model.velocity.y < 0 || this.model.position.y + this.model.velocity.y > game.height) {
            this.model.velocity.y = -this.model.velocity.y;
            this.emit("moveDecisionMade", {pos:this.model.position.copy(), vel:this.model.velocity.copy()});
        }
        
    },
    
    changeDirection: function() {
        if(this.model.framesInExistance % 25 == 0/*Math.random() > this.model.pathConfidence*/) {
            var currentAngle = this.model.velocity.toAngle(),
                mag = this.model.velocity.mag(),
                angleChange = ((Math.random() * 2) - 1) * 45;
            currentAngle += angleChange;
            this.model.velocity = Vector.fromAngle(currentAngle).scale(mag);
            this.emit("moveDecisionMade", {pos:this.model.position.copy(), vel:this.model.velocity.copy()});
        }
    },
    
    detectObjects: function() {
        var detectedObjects = [];
        for(var i = 0; i < game.numberOfDudes; i++) {
            if(game.runners[i] != this) {
                var currentRunner = game.runners[i].model;
                if(distance(this.model.position, currentRunner.position) < this.model.genes.get("senseRadius") * 100) {
                    detectedObjects.push(game.runners[i].model);
                }
            }
        }
        if(distance(this.model.position, game.ball.model.position) < this.model.genes.get("senseRadius") * 100) {
            detectedObjects.push(game.ball.model);
        }
        return detectedObjects;
    },
    
    getNearestObject: function() {
        var nearbyObjects = this.detectObjects(),
            nearestObjectDistance = Math.max(game.width, game.height),
            nearestObject = null;
        for(var i = 0; i < nearbyObjects.length; i++) {
            var objectDist = distance(this.model.position, nearbyObjects[i].position);
            if(objectDist < nearestObjectDistance) {
                nearestObjectDistance = objectDist;
                nearestObject = nearbyObjects[i];
            }
        }
        return nearestObject;
    },
    
    getDistanceToNearestObject: function() {
        var nearestObj = this.getNearestObject();
        if(!!nearestObj) {
            return distance(this.model.position, this.getNearestObject().position);
        } else {
            return -1;
        }
    },
    
    setupAttributes: function() {
        var model = this.model,
            genes = this.model.genes;
        genes.generateRandomData();
        model.position = new Vector(game.width/2, game.height/2);//(randomInt(0, game.width), randomInt(0, game.height));
        model.prevPosition = model.position.copy();
        model.angleConfidence = genes.get("angleConfidence");
        model.pathConfidence = genes.get("pathConfidence");
        model.velocityConfidence = genes.get("velocityConfidence");
        model.directionalBias = genes.get("directionalBias");
        model.velocityBias = genes.get("velocityBias");
        var r = parseInt(genes.get("red") * 255),
            g = parseInt(genes.get("green") * 255),
            b = parseInt(genes.get("blue") * 255);
        model.colour = {r:r, g:g, b:b};
        model.size = mapValue(genes.get("size"), 0, 1, 10, 20);
        model.velocity = new Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
        model.framesInExistance = 0;
        this.setupTail();
        
//        console.log(model.genes);
    },
    
    setupTail: function() {
        var model = this.model,
            genes = this.model.genes;
        
        model.tail = [];
        
        switch(Math.round(genes.get("tailLength") * 2)) {
            case 0:
                model.tailLength = randomInt(10, 20);
                break;
            case 1:
                model.tailLength = randomInt(20,30);
                break;
            case 2:
                model.tailLength = randomInt(30, 40);
                break;
        } 
        
        //debug
        model.tailLength = 25;
        
        
        for(var i = 0; i < model.tailLength; i++) {
            var size = mapValue(i, 0, model.tailLength, model.size, model.size * 0.4), 
                index = i,
                parent = model.tail[i-1] ? model.tail[i-1].model : model,
                currentSegment = new SegmentController(new SegmentModel(index, size, model.colour, genes.get("brightnessVariation")), parent);
            
            this.on('moveDecisionMade', currentSegment.onMoveDecisionMade, currentSegment);
            
            model.tail.push(currentSegment);
        }
                    
    },
    
    reactToObjects: function() {
        var distanceToNearestObject = this.getDistanceToNearestObject();
        if(distanceToNearestObject > -1) {
            var normalisedDistance = mapValue(distanceToNearestObject, 0, this.model.genes.get("senseRadius") * 100, 0, 1);
            
            //velocity
            this.model.velocity = this.affectTraitByDistanceToObject(this.model.originalvelocity, 
                                                                  normalisedDistance, 
                                                                  this.model.genes.get("velocityObjectEffect"), 
                                                                  this.model.genes.get("objectAffectsSpeed"));
            
            //direction
            this.model.directionalBias = this.affectTraitByDistanceToObject(this.model.genes.get("directionalBias"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("directionalBiasObjectEffect"),
                                                                            this.model.genes.get("objectAffectsDirectionalBias"));
            //confidence
            this.model.velocityConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("velocityConfidence"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("velocityConfidenceObjectEffect"), 
                                                                            this.model.genes.get("objectAffectsvelocityConfidence"));
            
            this.model.angleConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("angleConfidence"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("angleConfidenceObjectEffect"), 
                                                                            this.model.genes.get("objectAffectsAngleConfidence"));
            
            this.model.pathConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("pathConfidence"),
                                                                           normalisedDistance, 
                                                                           this.model.genes.get("pathConfidenceObjectEffect"), 
                                                                           this.model.genes.get("objectAffectsPathConfidence"));
            
        } else {
            this.model.velocity = this.model.originalVelocity;
            this.model.directionalBias = this.model.genes.get("directionalBias");
            this.model.velocityConfidence = this.model.genes.get("velocityConfidence");
            this.model.angleConfidence = this.model.genes.get("angleConfidence");
            this.model.pathConfidence = this.model.genes.get("pathConfidence");
        }
    },
    
    affectTraitByDistanceToObject: function(originalTraitValue, normalisedDistance, maximumObjectAffectedTrait, amountObjectAffectsTrait) {
        var objectImpact = this.model.genes.get("caresAboutObjects") * amountObjectAffectsTrait * (1 - normalisedDistance);
        var newValue = mapValue(objectImpact, 0, 1, originalTraitValue, maximumObjectAffectedTrait);
        return newValue;
    },
    
    update:function() {
//        this.reactToObjects();
        this.changeDirection();
        this.advance(this.model.velocity);
        this.model.framesInExistance++;
    }
    
}