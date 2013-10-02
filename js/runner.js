function RunnerModel(genes) {
    if(!!genes) {
        this.genes = genes;
        this.isOffspring = true;
    } else {
        this.isOffspring = false;
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
              "stripy",
              "red", 
              "green",
              "blue"
             ])
        });
        this.genes.generateRandomData();
    }
    this.index = game.runners.length;
    this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    this.velocity = new Vector(0, 0);//(randomInt(0, game.width), randomInt(0, game.height));
    this.acceleration = new Vector(Math.random() * 4 - 2, Math.random() * 4 - 2);
    this.lastPosition = this.position.copy();
    this.angleConfidence = this.genes.get("angleConfidence");
    this.pathConfidence = 0.99//this.genes.get("pathConfidence");
    this.velocityConfidence = this.genes.get("velocityConfidence");
    this.directionalBias = this.genes.get("directionalBias");
    this.velocityBias = this.genes.get("velocityBias");
    var r = parseInt(this.genes.get("red") * 255),
        g = parseInt(this.genes.get("green") * 255),
        b = parseInt(this.genes.get("blue") * 255);
    this.colour = {r:r, g:g, b:b};
    this.size = mapValue(this.genes.get("size"), 0, 1, 10, 20);
    this.framesInExistance = 0;
    
    this.type = "runner";
}

function RunnerView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

RunnerView.prototype = {
    destroy: function() {
        //game.off('render');
    },
    
    render: function() {
        this.renderEyes();
    },
    
    renderEyes: function() {
        this.context.save();
        
        this.context.translate(this.model.tail.model.segments[0].model.position.x, this.model.tail.model.segments[0].model.position.y);
        
        this.context.rotate(degToRad(this.model.velocity.toAngle()));
        
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
    this.setupTail();
    this.view = new RunnerView(model, game.context);
    game.on('update', this.update, this);
    game.on('generationEnded', this.destroy, this);
}

RunnerController.prototype = {
    
    advance: function() {
        // Inertia: objects in motion stay in motion.
        this.model.velocity.x = this.model.position.x - this.model.lastPosition.x;
        this.model.velocity.y = this.model.position.y - this.model.lastPosition.y;
                
        var nextX = this.model.position.x + this.model.velocity.x + this.model.acceleration.x * game.timestepSquared,
            nextY = this.model.position.y + this.model.velocity.y + this.model.acceleration.y * game.timestepSquared;
        
        this.model.lastPosition = this.model.position.copy();
        
        this.model.position.x = nextX;
        this.model.position.y = nextY;
        // acceleration only lasts for one update!
        if(game.timestepSquared == 1 && !this.model.acceleration.equalTo(new Vector(0, 0))) {
            this.model.acceleration = new Vector(0,0);
        }
        this.checkForBoundaries();
    },
    
    checkForBoundaries: function() {
        if(this.model.position.x < 0 || this.model.position.x > game.width) {
            this.model.position.x -= this.model.velocity.x * 2;
        }
        if(this.model.position.y < 0 || this.model.position.y > game.height) {
            this.model.position.y -= this.model.velocity.y * 2;
        }
    },
    
    changeDirection: function() {
        if(Math.random() > this.model.pathConfidence) {
            var currentAngle = this.model.velocity.toAngle(),
                mag = this.model.velocity.mag(),
                angleChange = ((Math.random() * 2) - 1) * 5;
            console.log("current velocity: " + this.model.velocity);
            console.log("current angle: " + currentAngle);
            currentAngle += angleChange;
            console.log("new Angle: " + currentAngle);
            var vel = Vector.fromAngle(currentAngle);
            console.log("new velocity: " + vel);
            this.model.position.increment(vel);
        }
    },
    
    destroy: function() {
        game.off('update', this.update, this);
        game.off('generationEnded', this.destroy, this);;
        this.view.destroy();
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
            var dist = distance(this.model.position, this.getNearestObject().position);
            if(nearestObj.type == "ball" && dist < nearestObj.radius) {
                game.emit("runnerCollidedWithBall", {runner: this});
            }
            return distance;
        } else {
            return -1;
        }
    },
    
    
    setupTail: function() {
        var model = this.model,
            genes = this.model.genes;
        
        switch(Math.round(genes.get("tailLength") * 2)) {
            case 0:
                model.tailLength = randomInt(3, 10);
                break;
            case 1:
                model.tailLength = randomInt(10, 18);
                break;
            case 2:
                model.tailLength = randomInt(18, 26);
                break;
        }
        
        model.tail = new TailController(new TailModel(model.tailLength, model.size, model.colour, genes.get("stripy"), this));
    },
    
    reactToObjects: function() {
        var distanceToNearestObject = this.getDistanceToNearestObject();
        if(distanceToNearestObject > -1) {
            var normalisedDistance = mapValue(distanceToNearestObject, 0, this.model.genes.get("senseRadius") * 100, 0, 1);
            /*
            //velocity
            this.model.velocity = this.affectTraitByDistanceToObject(this.model.originalvelocity, 
                                                                  normalisedDistance, 
                                                                  this.model.genes.get("velocityObjectEffect"), 
                                                                  this.model.genes.get("objectAffectsSpeed"));*/
            
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
        this.advance();
        this.model.framesInExistance++;
    }
    
}