function RunnerModel() {
    this.genes = {
    behaviour: new Chromosome(
        ["pathConfidence", 
         "angleConfidence", 
         "speedConfidence", 
         "senseRadius",
         "caresAboutObjects",
         "objectAffectsSpeed",
         "objectAffectsDirection",
         "objectAffectsAngleConfidence",
         "objectAffectsPathConfidence",
         "directionalBias"
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
    };
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
        this.renderBodySegment(this.model.position, this.model.angle);
        
        for(var i = 0; i < this.model.tailLength; i++) {
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
        
        this.context.strokeWidth = this.sizeMultiple;
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
    advance:function(speed) {
        this.model.position.x += speed * Math.cos(degToRad(this.model.angle));
        this.model.position.y += speed * Math.sin(degToRad(this.model.angle));
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
        if(Math.random() > this.model.genes.behaviour.getValue("pathConfidence")) {
            var angleChange = mapValue(this.model.genes.behaviour.getValue("angleConfidence"), 0, 1, randomInt(0,30), 0);
            if(Math.random() < this.model.directionalBias) {
                angleChange = - angleChange;
            }
            this.model.angle = (360 + (this.model.angle + angleChange)) % 360;
        }
    },
    
    detectObjects: function() {
        var detectedObjects = [];
        for(var i = 0; i < game.numberOfDudes; i++) {
            if(game.runners[i] != this) {
                var currentRunner = game.runners[i].model;
                if(distance(this.model.position, currentRunner.position) < this.model.genes.behaviour.getValue("senseRadius") * 100) {
                    detectedObjects.push(game.runners[i].model);
                }
            }
        }
        if(distance(this.model.position, game.ball.model.position) < this.model.genes.behaviour.getValue("senseRadius") * 100) {
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
        genes.behaviour.generateRandomData();
        genes.appearance.generateRandomData();
        model.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
        model.angleConfidence = genes.behaviour.getValue("angleConfidence");
        model.directionalBias = genes.behaviour.getValue("angleConfidence");
        model.angle = randomInt(0, 360);
        var r = parseInt(genes.appearance.getValue("red") * 255),
            g = parseInt(genes.appearance.getValue("green") * 255),
            b = parseInt(genes.appearance.getValue("blue") * 255);
        model.colour = {r:r, g:g, b:b};
        model.size = mapValue(genes.appearance.getValue("size"), 0, 1, 10, 20);
        model.sizeMultiple = 2 * model.size / 10;
        model.movementSpeed = model.speed = model.sizeMultiple * ((genes.behaviour.getValue("speedConfidence") / 2) + 0.5);
        this.setupTail();
        model.framesInExistance = 0;
        model.totalPreviousPositions = model.tailLength * model.tailSpacing;
        model.previousPositions = [];
        
        console.log(model.genes);
    },
    
    setupTail: function() {
        var model = this.model,
            genes = this.model.genes;
        switch(Math.round(genes.appearance.getValue("tailLength") * 2)) {
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
        model.tailSpacing = 2;
        model.tailIndex = 0;
        model.tail = new Array(model.tailLength);
        model.tailColours = new Array(model.tailLength);
        var originalColour = model.colour;
        console.log(originalColour);
        for(var i = 0; i < model.tailLength; i++) {
            var varyColourBy = mapValue(genes.appearance.getValue("brightnessVariation"), 0, 1, 0, (Math.random() * 2) - 1);
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
            //speed
            var newMaxSpeed = this.model.movementSpeed * this.model.genes.behaviour.getValue("objectAffectsSpeed") * 2;
            this.model.speed = mapValue(distanceToNearestObject, 0, this.model.genes.behaviour.getValue("senseRadius") * 100, newMaxSpeed, this.model.movementSpeed);
            
            //direction
            var normalisedDistance = mapValue(distanceToNearestObject, 0, this.model.genes.behaviour.getValue("senseRadius") * 100, 0, 1),
                objectEffect = this.model.genes.behaviour.getValue("caresAboutObjects") * normalisedDistance,
                changeDirection = this.model.genes.behaviour.getValue("objectAffectsDirection") * objectEffect,
                newDirectionalBias = limitNumber(this.model.directionalBias + changeDirection, 0, 1);
            this.model.directionalBias = mapValue(normalisedDistance, 0, 1, newDirectionalBias, this.model.genes.behaviour.getValue("directionalBias"));
        } else {
            this.model.speed = this.model.movementSpeed;
            this.model.directionalBias = this.model.genes.behaviour.getValue("directionalBias");
        }
    },
    
    update:function() {
        this.storePreviousPositions();
        this.reactToObjects();
        this.updateTailSegments();
        this.changeDirection();
        this.advance(this.model.speed);
        this.model.framesInExistance++;
    },
    
    updateTailSegments: function() {
        for (var i = 0; i < this.model.tailLength; i++) {
            var currentSegment = this.model.tail[i],
                spacing = this.model.tailSpacing,
                previousPositionIndex = i * spacing;
            if(previousPositionIndex < this.model.previousPositions.length) {
                currentSegment.position = this.model.previousPositions[previousPositionIndex].position;
                currentSegment.angle = this.model.previousPositions[previousPositionIndex].angle;
            }
        }
    },
    
    storePreviousPositions:function(){
        var prevPos = this.model.previousPositions,
            frames = this.model.framesInExistance,
            numPos = this.model.totalPreviousPositions;
        this.model.previousPositions.unshift({position: this.model.position.copy(), angle: this.model.angle});
        if(this.model.previousPositions.length > this.model.totalPreviousPositions) this.model.previousPositions.pop();
    }
}