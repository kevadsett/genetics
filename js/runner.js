function RunnerModel(position) {
    this.behaviour = new Chromosome(["pathConfidence", "angleConfidence", "speedConfidence", "size", "senseRadius"]);
    this.appearance = new Chromosome(["tailLength", "size", "red", "green", "blue"]);
    this.gene = {
        pathConfidence: Math.random(),
        angleConfidence: Math.random(),
        speedConfidence: (Math.random() / 2) + 0.5,
        tailLength: randomInt(0,3),
        size: randomInt(10, 20),
        senseRadius: 100,//randomInt(0, 100),
        directionalBias: (Math.random() * 2) - 1,
        caresAboutObjects: Math.random(),
        tendencyToAvoid: Math.random(),
        objectSpeedUp: Math.random() * 2
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
    for(var i = 0; i < this.tailLength; i++) {
        this.tail[i] = {position: this.position.copy(), angle: this.angle};
    }
    this.framesInExistance = 0;
    this.totalPreviousPositions = this.tailLength * this.tailSpacing;
    this.previousPositions = new Array(this.totalPreviousPositions);
    for(var i = 0; i < this.totalPreviousPositions; i++) {
        this.previousPositions[i] = {};
    }
    console.log(this.gene);
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
            this.renderBodySegment(this.model.tail[i].position, this.model.tail[i].angle);
        }
        
        this.renderEyes(this.model.position, this.model.angle);
    },
    
    renderBodySegment: function(position, angle) {
        if(!position) return;
        this.context.save();
        this.context.translate(position.x, position.y);
        
        this.context.rotate(degToRad(angle));
        
        this.context.fillStyle = rgbObjToHexColourString(this.model.colour);
        
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
        this.advance(this.model.gene.speed);
        this.model.framesInExistance++;
    },
    
    updateTailSegments: function() {
        for (var i = 0; i < this.model.tailLength; i++) {
            var currentSegment = this.model.tail[i],
                spacing = this.model.tailSpacing,
                previousPositionIndex = (spacing*i) + (this.model.framesInExistance % spacing);
            currentSegment.position = this.model.previousPositions[previousPositionIndex].position;
            currentSegment.angle = this.model.previousPositions[previousPositionIndex].angle;
        }
    },
    
    storePreviousPositions:function(){
        var prevPos = this.model.previousPositions,
            frames = this.model.framesInExistance,
            numPos = this.model.totalPreviousPositions;
        prevPos[frames % numPos].position = this.model.position.copy();
        prevPos[frames % numPos].angle = this.model.angle;
    }
}