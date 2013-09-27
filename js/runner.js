function RunnerModel(genes) {
    if(!!genes) {
        this.genes = genes;
        this.isOffspring = true;
    } else {
        this.isOffspring = false;
        this.genes = new dna({
        behaviour: new Chromosome(
            ["speed",
             "pathConfidence", 
             "angleConfidence", 
             "speedConfidence", 
             "senseRadius",
             "caresAboutObjects",
             "objectAffectsSpeed",
             "speedObjectEffect",
             "objectAffectsDirectionalBias",
             "directionalBiasObjectEffect",
             "objectAffectsSpeedConfidence",
             "speedConfidenceObjectEffect",
             "objectAffectsAngleConfidence",
             "angleConfidenceObjectEffect",
             "objectAffectsPathConfidence",
             "pathConfidenceObjectEffect",
             "directionalBias",
             "speedBias"
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
    }
    this.type = "runner";
}

function RunnerView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

RunnerView.prototype = {
    destroy: function() {
        game.off('render');
    },
    render: function() {
        this.context.lineWidth = 2;
        
        this.context.fillStyle = this.model.tailColours[0];
        this.renderBodySegment(this.model.position, this.model.angle);
        
        for(var i = this.model.tailLength-1; i > 0; i--) {
            this.context.fillStyle = this.model.tailColours[i];
            this.renderBodySegment(this.model.tail[i].position, this.model.tail[i].angle, i);
        }
        
        this.renderEyes(this.model.position, this.model.angle);
    },
    
    renderBodySegment: function(position, angle, index) {
        if(!position) return;
        this.context.save();
        this.context.translate(position.x, position.y);
        
        this.context.rotate(degToRad(angle));
        var size = this.model.size * mapValue(index, 0, this.model.tailLength, 1, 0.3);
        this.context.fillRect(-size/2, -size/2, size, size);
        this.context.restore();
    },
    
    renderEyes: function(position, angle) {
        this.context.save();
        
        this.context.translate(position.x, position.y);
        
        this.context.rotate(degToRad(angle));
        
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
    this.model = model;
    this.setupAttributes();
    this.view = new RunnerView(model, game.canvas.getContext('2d'));
    game.on('update', this.update, this);
    game.on('generationEnded', this.destroy, this);
}

RunnerController.prototype = {
    advance:function(speed) {
        var speedChange = mapValue(this.model.speedConfidence, 0, 1, randomInt(0, 2), 0);
        if (Math.random() > this.model.speedBias) {
            speedChange = -speedChange;
        }
        speed += speedChange;
        
        
        for(var i = this.model.tailLength-1; i > 0; i--) {
            var segmentSize = this.model.size * mapValue(i, 0, this.model.tailLength, 1, 0.3),
                previousSegment = this.model.tail[i-1],
                currentSegment = this.model.tail[i];
            currentSegment.position = previousSegment.position.copy();
            currentSegment.angle = previousSegment.angle;
        }
        this.model.position.x += speed * Math.cos(degToRad(this.model.angle));
        this.model.position.y += speed * Math.sin(degToRad(this.model.angle));
        this.model.tail[0].position = this.model.position.copy();
        this.model.tail[0].angle = this.model.angle;
        this.checkForBoundaries();
    },
    
    checkForBoundaries: function() {
        var size = this.model.size;
        if(this.model.position.x < -size) {
            this.model.position.x = game.width + size;
        } else if (this.model.position.x > game.width + size) {
            this.model.position.x = -size;
        }
        if(this.model.position.y < -size) {
            this.model.position.y = game.height + size;
        } else if (this.model.position.y > game.height + size) {
            this.model.position.y = -size;
        }
    },
    
    changeDirection: function() {
        if(Math.random() > this.model.pathConfidence) {
            var angleChange = mapValue(this.model.angleConfidence, 0, 1, randomInt(0,30), 0);
            if(Math.random() < this.model.directionalBias) {
                angleChange = - angleChange;
            }
            this.model.angle = (360 + (this.model.angle + angleChange)) % 360;
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
    
    setupAttributes: function() {
        var model = this.model,
            genes = this.model.genes;
        if(!this.model.isOffSpring) {
            genes.generateRandomData();
        }
        model.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
        model.angleConfidence = 1//genes.get("angleConfidence");
        model.pathConfidence = 1//genes.get("pathConfidence");
        model.speedConfidence = 1//genes.get("speedConfidence");
        model.directionalBias = genes.get("directionalBias");
        model.speedBias = genes.get("speedBias");
        model.angle = randomInt(0, 360);
        var r = parseInt(genes.get("red") * 255),
            g = parseInt(genes.get("green") * 255),
            b = parseInt(genes.get("blue") * 255);
        model.colour = {r:r, g:g, b:b};
        model.size = mapValue(genes.get("size"), 0, 1, 10, 20);
        model.originalSpeed = model.speed = (model.size/3) * genes.get("speed");
        this.setupTail();
        model.framesInExistance = 0;
        
//        console.log(model.genes);
    },
    
    setupTail: function() {
        var model = this.model,
            genes = this.model.genes;
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
        model.tailLength = 20;
        model.tailIndex = 0;
        model.tail = new Array(model.tailLength);
        model.tailColours = new Array(model.tailLength);
        var originalColour = model.colour;
        for(var i = 0; i < model.tailLength; i++) {
            var varyColourBy = mapValue(genes.get("stripy"), 0, 1, 0, (Math.random() * 2) - 1);
            var brightnessModifier = parseInt(mapValue(varyColourBy, -1, 1, -100, 100));
            var newTailColour = brightenColour(originalColour, brightnessModifier);
            model.tailColours[i] = rgbObjToHexColourString(newTailColour);
        }
        
        for(var i = 0; i < model.tailLength; i++) {
            model.tail[i] = {position: model.position.copy(), angle: model.angle};
        }
    },
    
    reactToObjects: function() {
        var distanceToNearestObject = this.getDistanceToNearestObject();
        if(distanceToNearestObject > -1) {
            var normalisedDistance = mapValue(distanceToNearestObject, 0, this.model.genes.get("senseRadius") * 100, 0, 1);
            
            //speed
            this.model.speed = this.affectTraitByDistanceToObject(this.model.originalSpeed, 
                                                                  normalisedDistance, 
                                                                  this.model.genes.get("speedObjectEffect"), 
                                                                  this.model.genes.get("objectAffectsSpeed"));
            
            //direction
            this.model.directionalBias = this.affectTraitByDistanceToObject(this.model.genes.get("directionalBias"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("directionalBiasObjectEffect"),
                                                                            this.model.genes.get("objectAffectsDirectionalBias"));
            //confidence
            this.model.speedConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("speedConfidence"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("speedConfidenceObjectEffect"), 
                                                                            this.model.genes.get("objectAffectsSpeedConfidence"));
            
            this.model.angleConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("angleConfidence"),
                                                                            normalisedDistance, 
                                                                            this.model.genes.get("angleConfidenceObjectEffect"), 
                                                                            this.model.genes.get("objectAffectsAngleConfidence"));
            
            this.model.pathConfidence = this.affectTraitByDistanceToObject(this.model.genes.get("pathConfidence"),
                                                                           normalisedDistance, 
                                                                           this.model.genes.get("pathConfidenceObjectEffect"), 
                                                                           this.model.genes.get("objectAffectsPathConfidence"));
            
        } else {
            this.model.speed = this.model.originalSpeed;
            this.model.directionalBias = this.model.genes.get("directionalBias");
            this.model.speedConfidence = 1//this.model.genes.get("speedConfidence");
            this.model.angleConfidence = 1//this.model.genes.get("angleConfidence");
            this.model.pathConfidence = 1//this.model.genes.get("pathConfidence");
        }
    },
    
    affectTraitByDistanceToObject: function(originalTraitValue, normalisedDistance, maximumObjectAffectedTrait, amountObjectAffectsTrait) {
        var objectImpact = this.model.genes.get("caresAboutObjects") * amountObjectAffectsTrait * (1 - normalisedDistance);
        var newValue = mapValue(objectImpact, 0, 1, originalTraitValue, maximumObjectAffectedTrait);
        return newValue;
    },
    
    update:function() {
//        this.reactToObjects();
//        this.changeDirection();
        this.advance(this.model.speed);
        this.model.framesInExistance++;
    }
    
}