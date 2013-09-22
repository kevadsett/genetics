function RunnerModel(position) {
    this.behaviour = new Chromosome(["pathConfidence", "angleConfidence", "speedConfidence", "size", "senseRadius"]);
    this.appearance = new Chromosome(["tailLength", "size", "red", "green", "blue"]);
    this.gene = {
        pathConfidence: Math.random(),
        angleConfidence: Math.random(),
        speedConfidence: (Math.random() / 2) + 0.5,
        tailLength: randomInt(0,3),
        size: randomInt(10, 20),
        senseRadius: randomInt(0, 100),
        directionalBias: (Math.random() * 2) - 1,
        caresAboutObjects: Math.random(),
        objectSpeedUp: Math.random() * 2,
        colourVariation: Math.random(),
        brightnessVariation: Math.random(),
        spineColourDeviation: Math.random(),
        red: randomInt(0,256),
        green: randomInt(0,256),
        blue: randomInt(0,256)
    };
    if(position) {
        this.position = position;
    } else {
        this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    }
    this.angleConfidence = this.gene.angleConfidence;
    this.angle = randomInt(0, 360);
    this.colour = {r:this.gene.red, g:this.gene.green, b:this.gene.blue};
    this.sizeMultiple = 2 * this.gene.size / 10;
    this.speed = this.sizeMultiple * this.gene.speedConfidence;
    switch(this.gene.tailLength) {
        case 0:
            this.tailLength = randomInt(10, 20);
            break;
        case 1:
            this.tailLength = randomInt(20,30);
            break;
        case 2:
            this.tailLength = randomInt(30, 40);
            break;
    } 
    this.tailSpacing = 5;
    this.tailIndex = 0;
    this.tail = new Array(this.tailLength);
    this.tailColours = new Array(this.tailLength);
    var originalColour = this.colour;
    for(var i = 0; i < this.tailLength; i++) {
        var varyColourBy = mapValue(this.gene.brightnessVariation, 0, 1, 0, (Math.random() * 2) - 1);
        var brightnessModifier = parseInt(mapValue(varyColourBy, -1, 1, -100, 100));
        var newTailColour = brightenColour(originalColour, brightnessModifier);
        this.tailColours[i] = newTailColour;
    }
    
    for(var i = 0; i < this.tailLength; i++) {
        this.tail[i] = {position: this.position.copy(), angle: this.angle};
    }
    this.framesInExistance = 0;
    this.totalPreviousPositions = this.tailLength * this.tailSpacing;
    this.previousPositions = [];
}

function RunnerView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

RunnerView.prototype = {
    render: function() {
        this.context.lineWidth = 2;
        
        for(var i = 0; i < this.model.tailLength; i++) {
            this.context.fillStyle = rgbObjToHexColourString(this.model.tailColours[i]);
            this.renderBodySegment(this.model.tail[i].position, this.model.tail[i].angle);
        }
        
        this.renderEyes(this.model.position, this.model.angle);
    },
    
    renderBodySegment: function(position, angle) {
        if(!position) return;
        this.context.save();
        this.context.translate(position.x, position.y);
        
        this.context.rotate(degToRad(angle));
        
        this.context.fillRect(-this.model.gene.size/2, -this.model.gene.size/2, this.model.gene.size, this.model.gene.size);
        this.context.restore();
    },
    
    renderEyes: function(position, angle) {
        this.context.save();
        
        this.context.translate(position.x, position.y);
        
        this.context.rotate(degToRad(angle));
        
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
    },
    
    renderSpine: function() {
        this.context.strokeStyle = rgbObjToHexColourString(this.model.colour);
        this.context.beginPath();
        
        this.context.moveTo(this.model.tail[0].position.x, this.model.tail[0].position.y);
        
        for(var i = 0; i < this.model.tail.length; i++) {
            var currentTailSegment = this.model.tail[i];
            if(!!currentTailSegment.position) {
                if(!!this.model.tail[i+1] && !!this.model.tail[i+1].position) {
                    this.context.lineTo(this.model.tail[i+1].position.x, this.model.tail[i+1].position.y);
                    this.context.stroke();
                }
            }
        }
        /*this.context.moveTo(this.model.tail[0].position.x, this.model.tail[0].position.y);
        this.context.closePath();*/
    }
}

function RunnerController(model) {
    this.model = model;
    this.view = new RunnerView(model, game.canvas.getContext('2d'));
    game.on('update', this.update, this);
}

RunnerController.prototype = {
    advance:function(speed) {
        var distanceToNearestObject = this.getDistanceToNearestObject();
        if(distanceToNearestObject > -1) {
            speed *= mapValue(distanceToNearestObject, 0, this.model.gene.senseRadius, this.model.gene.objectSpeedUp, 1);
        }
        this.model.position.x += speed * Math.cos(degToRad(this.model.angle));
        this.model.position.y += speed * Math.sin(degToRad(this.model.angle));
        this.checkForBoundaries();
    },
    
    checkForBoundaries: function() {
        if(this.model.position.x - this.model.gene.size < 0) {
            if(this.model.angle > 180) {
                this.model.angle += 45;
            } else {
                this.model.angle -= 45;
            }
        } else if (this.model.position.x + this.model.gene.size > game.width) {
            if(this.model.angle > 180) {
                this.model.angle -= 45;
            } else {
                this.model.angle += 45;
            }
        }
        if(this.model.position.y - this.model.gene.size < 0) {
            if(this.model.angle > 270) {
                this.model.angle += 45;
            } else {
                this.model.angle -= 45;
            }
        } else if (this.model.position.y + this.model.gene.size > game.height) {
            if(this.model.angle > 90) {
                this.model.angle += 45;
            } else {
                this.model.angle -= 45;
            }
        }
    },
    
    changeDirection: function() {
        var distanceToNearestObject = this.getDistanceToNearestObject();
        if(distanceToNearestObject > -1) {
            var normalisedDistance = mapValue(distanceToNearestObject, 0, this.model.gene.senseRadius, 0, 1),
                objectEffect = this.model.gene.caresAboutObjects * normalisedDistance,
                objectAngle = getAngle(this.model.position, this.getNearestObject().position),
                deltaAngle = objectAngle - this.model.angle;
            //this.model.angle = objectAngle;
        } else {
            if(Math.random() > this.model.gene.pathConfidence) {
                var angleChange = mapValue(this.model.gene.angleConfidence, 0, 1, randomInt(0,30), 0);
                angleChange *= this.model.gene.directionalBias;
                this.model.angle = (360 + (this.model.angle + angleChange)) % 360;
            }
        }
    },
    
    detectObjects: function() {
        var detectedObjects = [];
        for(var i = 0; i < game.numberOfDudes; i++) {
            if(game.runners[i] != this) {
                var currentRunner = game.runners[i].model;
                if(distance(this.model.position, currentRunner.position) < this.model.gene.senseRadius) {
                    detectedObjects.push(game.runners[i].model);
                }
            }
        }
        if(distance(this.model.position, game.ball.model.position) < this.model.gene.senseRadius) {
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
    
    update:function() {
        this.storePreviousPositions();
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