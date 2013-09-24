function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.fromAngle = function(angle) {
    angle = degToRad(angle);
    return new Vector(Math.sin(angle), Math.cos(angle));
}

Vector.prototype = {
    add: function(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    },
    copy: function() {
        return new Vector(this.x, this.y);
    },
    equalTo: function(vector) {
        return vector.x == this.x && vector.y == this.y;
    },
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    scale: function(newScale) {
        return new Vector(this.x * newScale, this.y * newScale);
    },
    toAngle: function() {
        var quadrantStartAngle = 0;
        if(this.x >= 0) {
           quadrantStartAngle = 0;
        } else {
            quadrantStartAngle = 180;
        }
        return (360 + quadrantStartAngle + radToDeg(Math.atan(this.y/this.x))) % 360;
    },
    toString: function() {
        return "(" + Math.round(this.x) + ", " + Math.round(this.y) + ")";
    }
}