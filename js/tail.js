/*
* Model
*/
function TailModel(length, baseSize, baseColour, stripy, parent) {
    this.length = length;
    this.size = baseSize;
    this.colour = baseColour;
    this.stripy = stripy;
    this.parent = parent;
    this.position = parent.model.position;
    this.spacing = this.size/2;
    this.segments = [];
    this.bones = [];
}

/*
* View
*/
function TailView(model, context) {
    this.model = model;
    this.context = context;
    game.on("render", this.render, this);
}

TailView.prototype = {
    render: function() {
        this.context.lineCap = "round";
        /*this.context.moveTo(this.model.segments[0].model.points.front.x, this.model.segments[0].model.points.front.y);
        for(var i = 0; i < this.model.length; i++) {
            var currentSegmentModelPoints = this.model.segments[i].model.points;
            this.context.lineTo(currentSegmentModelPoints.right.x, currentSegmentModelPoints.right.y);
        }
        this.context.lineTo(currentSegmentModelPoints.back.x, currentSegmentModelPoints.back.y);
        for(var i = this.model.length-1; i >= 0; i--) {
            currentSegmentModelPoints = this.model.segments[i].model.points;
            this.context.lineTo(currentSegmentModelPoints.left.x, currentSegmentModelPoints.left.y);
        }
        this.context.lineTo(currentSegmentModelPoints.front.x, currentSegmentModelPoints.front.y);
        this.context.fillStyle = rgbObjToHexColourString(this.model.baseColour);
        this.context.fill();*/
        for(i = 0; i < this.model.bones.length; i++) {
            var currentBone = this.model.bones[i];
            this.context.beginPath();
            this.context.moveTo(currentBone.point1.x, currentBone.point1.y);
            this.context.lineTo(currentBone.point2.x, currentBone.point2.y);
            
            var currentSegment = this.model.segments[i-1] || this;
            this.context.lineWidth = currentSegment.model.size;
            this.context.strokeStyle = !!currentSegment.model.colour.r ? rgbObjToHexColourString(currentSegment.model.colour) : currentSegment.model.colour;
            this.context.stroke();
            this.context.closePath();
        }
    }
}

/*
* Controller
*/
function TailController(model) {
    this.model = model;
    this.generateSegments();
    this.view = new TailView(model, game.context);
    game.on('update', this.update, this);
}

TailController.prototype = {
    generateSegments: function() {
        for(var i = 0; i < this.model.length; i++) {
            var size = mapValue(i, 0, this.model.length, this.model.size, this.model.size * 0.4),
                segment = new SegmentController(new SegmentModel(size, this.model.colour, this.model.stripy, new Vector(this.model.position.x - this.model.spacing * i, this.model.position.y)));
            this.model.segments.push(segment);
            if(i > 0) {
                this.model.bones.push(new Link(this.model.segments[i-1].model.position, this.model.segments[i].model.position, size * 0.8, 1.5));
            }
        }
    },
    update: function() {
        this.model.segments[0].model.position.x = this.model.position.x;
        this.model.segments[0].model.position.y = this.model.position.y;
        for(var i = 0; i < game.NUM_CONSTRAINT_SOLVE; i++) {
            for(var j = 0; j < this.model.bones.length; j++) {
                this.model.bones[j].solve();
            }
        }
    }
}