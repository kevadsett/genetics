function mapValue(value, low1, high1, low2, high2) {
    var range1 = high1 - low1,
        range2 = high2 - low2;
    return ((value - low1) / range1 * range2 + low2);
};

function rgbObjToHexColourString(rgbObject) {
    function decToHex(decimal) {
        var string = decimal.toString(16);
        if (string.length == 1) string = "0" + string;
        return string;
    }
    return "#" + decToHex(rgbObject.r) + decToHex(rgbObject.g) + decToHex(rgbObject.b);
}

function hexColourStringToRgbObj(hexString) {
    function hexToDec(hexString) {
        return parseInt(hexString,16);
    }
    
    if(hexString.indexOf("#") != -1) hexString = hexString.slice(1, 7);
    var rString = hexString.slice(0, 2),
        gString = hexString.slice(2, 4),
        bString = hexString.slice(4, 6);
    return {r: hexToDec(rString), g: hexToDec(gString), b: hexToDec(bString)};
}

function coordinateIsWithinBounds(x, y, top, right, bottom, left) {
    return x >= left && x < right && y >= top && y < bottom;
}

function randomInt(lo, hi) { 
    return Math.floor(lo + (Math.random() * (hi - lo)));
}

function padNumber(number, digits) {
    var number = "" + number;
    while(number.length < digits) {
        number = "0" + number;
    }
    return number;
}

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

function getAgentAt(x, y) {
    var agentsAtCoords = [], i, runner;
    for (i = 0; i < game.runners.length; i++) {
        runner = game.runners[i].model;
        runner.selected = false;
        if(coordinateIsWithinBounds(x,
                                    y, 
                                    runner.position.y - runner.gene.size / 2,
                                    runner.position.x + runner.gene.size / 2,
                                    runner.position.y + runner.gene.size / 2,
                                    runner.position.x - runner.gene.size / 2)) {
            runner.selected = true;
            agentsAtCoords.push(runner);
        }
    }
    return agentsAtCoords;
}

function toDecimalPlaces(number, numberOfPlaces) {
    var multiplier = 10;
    if(numberOfPlaces > 0) {
        for(var i = 1; i < numberOfPlaces; i++) {
            multiplier *= 10;
        }
        return Math.round((multiplier * number))/multiplier;
    } else {
        return Math.round(number);
    }
}

function cloneObject(objectToClone) {
    var key, i, clonedArray = [];
    var clone = {};
    if(typeof objectToClone == "object") {
        if(objectToClone.length == undefined) {
            for(key in objectToClone){
                clone[key] = cloneObject(objectToClone[key]);
            }
        } else { // we're an array or string
            clone = objectToClone.slice(0)
            for(i = 0; i < clone.length; i++) {
                clone[i] = cloneObject(clone[i]);
            }
        }
    } else { // we're a number or some other basic datatype
        clone = objectToClone;
    }
    return clone;
}

// Pythag :)
function distance(position1, position2) {
    var sides = new Vector(position2.x - position1.x, position2.y - position1.y),
        squareSides = new Vector(sides.x * sides.x, sides.y * sides.y);
    return Math.sqrt(squareSides.x + squareSides.y);
}

function getAngle(position1, position2) {
    var sides = new Vector(position2.x - position1.x, position2.y - position1.y);
    return (360 + radToDeg(Math.atan2(sides.y, sides.x))) % 360;
}

function brightenColour(originalColour, brightnessModifier) {
    if(!!originalColour.indexOf) {// it's a string
        originalColour = hexColourStringToRgbObj(originalColour);
    }
    var newR = limitNumber(originalColour.r + brightnessModifier, 0, 255),
        newG = limitNumber(originalColour.g + brightnessModifier, 0, 255),
        newB = limitNumber(originalColour.b + brightnessModifier, 0, 255);
    return {r:newR, g: newG, b: newB};
}

function limitNumber(value, lowerLimit, upperLimit) {
    if(value > upperLimit) value = upperLimit;
    if(value < lowerLimit) value = lowerLimit;
    return value;
}