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
        this.canvas = document.getElementById('gameCanvas');
        this.resizeCanvas();
        for(var i = 0; i < 25; i++) {
            new RunnerController(new RunnerModel());
        }
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
        this.width = this.canvas.width = $(document).innerWidth();
        this.height = this.canvas.height = $(document).innerHeight();
    },
    update: function() {
        this.emit('update');
    }
};