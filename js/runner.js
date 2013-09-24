function RunnerModel() {
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
        
        this.context.fillStyle = this.model.tailColours[0];
        
//        for(var i = this.model.tailLength-1; i >= 0; i--) {
        for(var i = 0; i < this.model.tailLength; i++) {
            this.context.fillStyle = this.model.tailColours[i];
            this.renderBodySegment(this.model.tail[i]);
        }
        
        this.renderEyes(this.model.tail[0]);
    },
    
    renderBodySegment: function(segment) {
        if(!segment.position) return;
        this.context.save();
        this.context.translate(segment.position.x, segment.position.y);
        this.context.rotate(degToRad(segment.velocity.toAngle()));
        var size = segment.size;
        this.context.fillRect(-size/2, -size/2, size, size);
        this.context.restore();
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
    this.model = model;
    this.setupAttributes();
    this.view = new RunnerView(model, game.canvas.getContext('2d'));
    game.on('update', this.update, this);
}

RunnerController.prototype = {
    /*advance:function(speed) {
        var speedChange = mapValue(this.model.speedConfidence, 0, 1, randomInt(0, 2), 0);
        if (Math.random() > this.model.speedBias) {
            speedChange = -speedChange;
        }
        speed += speedChange;
        speed = 1;
        
        this.model.position = this.getNextPosition(this.model.position, speed, this.model.angle);
        
//        for(var i = this.model.tailLength -1; i >= 0 ; i--) {
        for(var i = 0; i < this.model.tailLength; i++) {
            this.advanceSegment(this.model.tail[i], speed);
        }
        if(!this.model.prevPosition.equalTo(this.model.position)) {
            this.model.prevPosition = this.model.position.copy();
        }
        if(this.model.prevAngle != this.model.angle) {
            this.model.prevAngle = this.model.angle;
        }
    },*/
    
    advance: function(speed) {
        var speedChange = mapValue(this.model.speedConfidence, 0, 1, randomInt(0, 2), 0);
        if (Math.random() > this.model.speedBias) {
            speedChange = -speedChange;
        }
        speed += speedChange;
        this.model.position = this.model.position.add(this.model.velocity);
        for(var i = 0; i < this.model.tailLength; i++) {
            this.advanceSegment(this.model.tail[i]);
        }
    },
    
    advanceSegment: function(segment) {
        var parent = this.model.tail[segment.index - 1] || this.model;
        segment.velocity = parent.velocity.copy();
        segment.position = segment.position.add(segment.velocity);
    },
    
    /*advanceSegment: function(segment, speed) {
        var parent = this.model.tail[segment.index - 1] || this.model;
        var moveAmount = parent.size == segment.size ? 0 : -(speed + (parent.size + segment.size)/2);
        segment.position = this.getNextPosition(parent.position, moveAmount , parent.angle)
        segment.angle = getAngle(segment.position, parent.prevPosition)
//        segment.prevPosition = segment.position.copy();
    },*/
    
    checkForBoundaries: function(segment) {
        var size = segment.size;
        if(segment.position.x < -size) {
            segment.position.x = game.width + size;
        } else if (segment.position.x > game.width + size) {
            segment.position.x = -size;
        }
        if(segment.position.y < -size) {
            segment.position.y = game.height + size;
        } else if (segment.position.y > game.height + size) {
            segment.position.y = -size;
        }
    },
    
    changeDirection: function() {
        if(Math.random() > this.model.pathConfidence) {
            var angleChange = mapValue(this.model.angleConfidence, 0, 1, randomInt(0,30), 0);
            if(Math.random() < this.model.directionalBias) {
                angleChange = - angleChange;
            }
            this.model.velocity = Vector.fromAngle((360 + (this.model.velocity.toAngle() + angleChange)) % 360)
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
        model.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
        model.velocity = new Vector(0, 1);//(randomInt(-10, 10), randomInt(-10, 10));
        model.prevPosition = model.position.copy();
        model.angleConfidence = genes.get("angleConfidence");
        model.pathConfidence = genes.get("pathConfidence");
        model.speedConfidence = genes.get("speedConfidence");
        model.directionalBias = genes.get("directionalBias");
        model.speedBias = genes.get("speedBias");
        var r = parseInt(genes.get("red") * 255),
            g = parseInt(genes.get("green") * 255),
            b = parseInt(genes.get("blue") * 255);
        model.colour = {r:r, g:g, b:b};
        model.size = mapValue(genes.get("size"), 0, 1, 10, 20);
        model.originalSpeed = model.speed = (model.size/3) * genes.get("speed");
        model.framesInExistance = 0;
        this.setupTail();
        
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
        console.log(this.model.velocity)
        console.log(this.model.velocity.toAngle())
        model.tailLength = 5
        model.tailSpacing = 2;
        model.tailIndex = 0;
        model.tail = new Array(model.tailLength);
        model.tailColours = new Array(model.tailLength);
        var originalColour = model.colour;
        for(var i = 0; i < model.tailLength; i++) {
            var varyBrightnessBy = mapValue(genes.get("brightnessVariation"), 0, 1, 0, (Math.random() * 2) - 1);
            var brightnessModifier = parseInt(mapValue(varyBrightnessBy, -1, 1, -100, 100));
            var newTailColour = brightenColour(originalColour, brightnessModifier);
            model.tailColours[i] = rgbObjToHexColourString(newTailColour);
        }
        
        var currentLength = 0;
        console.log("startPos: " + model.position)
        for(var i = 0; i < model.tailLength; i++) {
            var currentSegment = {position: model.position.copy(), size: mapValue(i, 0, model.tailLength, model.size, model.size * 0.4), index: i},
                parent = model.tail[i-1] || model,
                hyp = new Vector(parent.size/2 + currentSegment.size/2, parent.size/2 + currentSegment.size/2).mag();
            console.log("hyp: " + Math.round(hyp));
            var x = hyp * Math.cos(degToRad(parent.velocity.toAngle())),
                y = hyp * Math.sin(degToRad(parent.velocity.toAngle()));
            currentLength += (currentSegment.size * 1);
            console.log(new Vector(x,y).toString());
            currentSegment.position = new Vector(-x, -y).add(parent.position);
            console.log("new position: " + currentSegment.position)
            currentSegment.velocity = parent.velocity.copy();
            model.tail[i] = currentSegment;
            console.log("angle: " + Math.round(currentSegment.velocity.toAngle()));
        }
        console.log(model.tail);
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
            this.model.speedConfidence = this.model.genes.get("speedConfidence");
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
//        this.advance(this.model.speed);
        this.model.framesInExistance++;
    }
    
}