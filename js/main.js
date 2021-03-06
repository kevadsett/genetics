// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
function Game() {
    $(document).ready($.proxy(function() {
        Events(this);
        $('body').append('<div id="canvasContainer"><canvas id="gameCanvas"></canvas></div>');
        this.setup();
        this.loop();
    }, this));
}

Game.prototype = {
    loop: function() {
        requestAnimFrame($.proxy(this.loop, this));
        
        var currentTime = new Date().getTime(),
            elapsedTime = currentTime - this.lastCalledTime + this.leftOverTime;
        this.lastCalledTime = currentTime;
        var timeSteps = Math.floor(elapsedTime / 16);
        this.leftOverTime = elapsedTime - timeSteps * 16;
        for(var i = 0; i < timeSteps; i++) {
            this.timestepSquared = i * i;
            this.update();
        }
        this.render();
        
        this.fps[this.frame & this.fps.length] = 1/elapsedTime;
        this.averageFPS = 0;
        for(var i = 0; i < this.fps.length; i++) {
            this.averageFPS += this.fps[i];
        }
        this.averageFPS /= this.fps.length;
    },
    render: function() {
        this.context.clearRect(0, 0, this.width, this.height);
        document.getElementById("fpsCounter").innerHTML = "<p>" + Math.round(this.averageFPS) + "</p>"
        this.emit('render');
    },
    resizeCanvas: function() {
        var canvas = document.getElementById("gameCanvas"),
            container = document.getElementById("canvasContainer");
        console.log(container.clientWidth / container.clientHeight);
        if(container.clientWidth / container.clientHeight > 1.3) {
            this.width = canvas.width = container.clientWidth;
            this.height = canvas.height = canvas.width / 1.33;
        } else {
            this.height = canvas.height = container.clientHeight;
            this.width = canvas.width = canvas.height / 1.33;
        }
        container.style.marginTop = -canvas.height / 2;
        container.style.marginLeft = -canvas.width / 2;
    },
    setup: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.lastCalledTime = new Date().getTime();
        this.leftOverTime = 0;
        this.runnersPerGeneration = 50;
        this.frame = 0;
        this.slowFrameRate = 1;
        this.fps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.NUM_CONSTRAINT_SOLVE = 3;
        
        this.resizeCanvas();
//        $(window).on('resize', this.resizeCanvas, this);
        this.runners = [];
        for(var i = 0; i < this.runnersPerGeneration; i++) {
            this.runners.push(new RunnerController(new RunnerModel()));
        }
        this.ball = new BallController(new BallModel());
        
        this.canvas.onclick = $.proxy(function(event) {
            var canvasBounds = event.target.getBoundingClientRect();
            this.ball.moveTo(event.clientX - canvasBounds.left, event.clientY - canvasBounds.top);
        }, this);
        
    },
    update: function() {
        this.emit('update');
    }
};