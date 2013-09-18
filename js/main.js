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
        this.canvas = document.getElementById('gameCanvas');
        this.resizeCanvas();
        this.runners = [];
        for(var i = 0; i < 50; i++) {
            this.runners.push(new RunnerController(new RunnerModel()));
        }
        
        this.canvas.onclick = function(event) {
            var canvasBounds = event.target.getBoundingClientRect();
            var clickedAgents = getAgentsAt(event.clientX - canvasBounds.left, event.clientY - canvasBounds.top);
            if(clickedAgents.length > 0) console.log(clickedAgents);
        };
        
        this.loop();
    }, this));
}

Game.prototype = {
    loop: function() {
        requestAnimFrame($.proxy(this.loop, this));
        this.update();
        this.render();
    },
    render: function() {
        this.resizeCanvas();
        this.emit('render');
    },
    resizeCanvas: function() {
        var canvas = document.getElementById("gameCanvas"),
            container = document.getElementById("canvasContainer");
        this.width = canvas.width = container.clientWidth;
        this.height = canvas.height = canvas.width / 1.33;
        container.style.marginTop = -canvas.height / 2;
        container.style.marginLeft = -canvas.width / 2;
    },
    update: function() {
        this.emit('update');
    }
};