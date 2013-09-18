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

function getAgentsAt(x, y) {
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