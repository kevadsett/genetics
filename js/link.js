function Link(point1, point2, restingDistance, stiffness) {
    this.point1 = point1;
    this.point2 = point2;
    this.restingDistance = restingDistance;
    this.stiffness = stiffness;
}

Link.prototype = {
    solve: function() {
        // calculate the difference
        var diff = this.point1.sub(this.point2),
            mag = diff.mag(),
            potentialScalar = (this.restingDistance - mag) / mag,
            differenceScalar = potentialScalar == Infinity ? 0 : potentialScalar,
            translateX = diff.x  * 0.5 * differenceScalar * this.stiffness,
            translateY = diff.y  * 0.5 * differenceScalar * this.stiffness;
        this.point1.increment(new Vector(translateX, translateY));
        this.point2.increment(new Vector(-translateX, -translateY));
    }
}