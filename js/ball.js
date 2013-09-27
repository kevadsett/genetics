function BallModel(position) {
    if(position) {
        this.position = position;
    } else {
        this.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
    }
    this.parentRunners = [];
    this.type = "ball";
    this.radius = 10;
    this.generation = 0;
    this.generationFrames = 0;
    console.log(this.position);
}

function BallView(model, context) {
    this.model = model;
    this.context = context;
    game.on('render', this.render, this);
}

BallView.prototype = {
    render: function() {
        this.context.save();
        this.context.translate(this.model.position.x, this.model.position.y);
        this.context.fillStyle = "#FF0000";
        this.context.arc(0, 0, this.model.radius, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
    }
}

function BallController(model) {
    this.model = model;
    this.view = new BallView(model, game.context);
    game.on('update', this.update, this);
    game.on('runnerCollidedWithBall', this.onRunnerCollision, this);
}

BallController.prototype = {
    update:function() {
        this.model.generationFrames++;
    },
    moveTo:function(x, y) {
        this.model.position.x = x;
        this.model.position.y = y;
    },
    onRunnerCollision: function(data) {
        if(this.model.parentRunners.indexOf(data.runner) == -1) {
            this.model.parentRunners.push(data.runner);
        } else {
            return;
        }
        if(this.model.parentRunners.length == 2) {
            game.emit("generationEnded");
            console.log("Generation " + this.model.generation + " is over in " + this.model.generationFrames + " frames.");
            console.log(this.model.parentRunners);
            for(var i = 0; i < game.runnersPerGeneration; i++) {
                game.runners[i] = new RunnerController(new RunnerModel(makeABaby(this.model.parentRunners[0].model, this.model.parentRunners[1].model)));
            }
            this.model.parentRunners = [];
            this.model.position = new Vector(randomInt(0, game.width), randomInt(0, game.height));
            game.on('render', this.view.render, this.view);
            this.model.generationFrames = 0;
            this.model.generation++;
        }
    }
}