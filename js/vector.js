function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.fromAngle = function(angle) {
    angle = degToRad(angle);
    return new Vector(Math.cos(angle), Math.sin(angle));
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
    getRelativePosition: function(distance, angle) {
        var x = distance * Math.cos(degToRad(angle ? angle : this.toAngle())),
            y = distance * Math.sin(degToRad(angle ? angle : this.toAngle()));
        return new Vector(x,y);
    },
    increment: function(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    },
    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    scale: function(newScale) {
        return new Vector(this.x * newScale, this.y * newScale);
    },
    sub: function(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    },
    toAngle: function() {
        var quadrantStartAngle = 0;
        if(this.x >= 0) {
           quadrantStartAngle = 0;
        } else {
            quadrantStartAngle = 180;
        }
        return (360 + quadrantStartAngle + radToDeg(Math.atan(this.y/this.x))) % 360 || 0;
    },
    toString: function() {
        return "(" + toDecimalPlaces(this.x, 2) + ", " + toDecimalPlaces(this.y, 2) + ")";
    },
    limit: function(x0, x1, y0, y1) {
        if(this.x < x0) this.x = x0;
        if(this.x > x1) this.x = x1;
        if(this.y < y0) this.y = y0;
        if(this.y > y1) this.y = y1;
    }
}