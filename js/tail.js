/*
* Model
*/
function TailModel(length, baseSize, baseColour, stripy, parent) {
    this.length = length;
    this.baseSize = baseSize;
    this.baseColour = baseColour;
    this.stripy = stripy;
    this.parent = parent;
    this.position = parent.model.position;
    this.spacing = this.baseSize/2;
    this.segments = [];
    this.bones = [];
}

/*
* Controller
*/
function TailController(model) {
    this.model = model;
    this.generateSegments();
    game.on('update', this.update, this);
}

TailController.prototype = {
    generateSegments: function() {
        for(var i = 0; i < this.model.length; i++) {
            var size = mapValue(i, 0, this.model.length, this.model.baseSize, this.model.baseSize * 0.4),
                segment = new SegmentController(new SegmentModel(size, this.model.baseColour, this.model.stripy, new Vector(this.model.position.x - this.model.spacing * i, this.model.position.y)));
            this.model.segments.push(segment);
            if(i > 0) {
                this.model.bones.push(new Link(this.model.segments[i-1].model.position, this.model.segments[i].model.position, size));
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