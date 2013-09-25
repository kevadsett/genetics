function Allele(type, value, dominant) {
    this.type = type;
    this.value = value;
    this.dominant = dominant;
}

Allele.prototype = {
    generateRandomData: function() {
        var randomValue = Math.random();
        if(allelDominance[this.type].type == "loMedHi") {
            switch (true) {
                case randomValue < 0.3333:
                    this.stringValue = "low";
                    this.dominant = allelDominance[this.type].low;
                    break;
                case randomValue < 0.6667:
                    this.stringValue = "medium";
                    this.dominant = allelDominance[this.type].medium;
                    break;
                case randomValue <= 1:
                    this.stringValue = "high";
                    this.dominant = allelDominance[this.type].high;
                break;
            }
        } else if (allelDominance[this.type].type == "loHi") {
            switch (true) {
                case randomValue < 0.5:
                    this.stringValue = "low";
                    this.dominant = allelDominance[this.type].low;
                    break;
                case randomValue <=1:
                    this.stringValue = "high";
                    this.dominant = allelDominance[this.type].high;
                break;
            }
        }
        this.value = randomValue;
    }
}

function Chromosome(types) {
    this.strands = new Array(2);
    this.loci = types;
    this.numLoci = types.length;
    var loci = {};
    for(var i = 0; i < types.length; i++) {
        loci[types[i]] = new Allele(types[i]);
    }
    this.strands[0] = cloneObject(loci);
    this.strands[1] = cloneObject(loci);
}

Chromosome.prototype = {
    generateRandomData: function() {
        for(var i = 0; i < 2; i++) {
            for(var key in this.strands[i]) {
                this.strands[i][key].generateRandomData()
            }
        }
    },
    setValue:function(type, value) {
        this.strands[0][type].value = this.strands[1][type].value = value;
    },
    getValue:function(type) {
        if(!(this.strands[0][type] && this.strands[0][type])) return;
        if(this.strands[0][type].dominant) {
            if(this.strands[1][type].dominant) {
                if(this.strands[0][type].value == this.strands[1][type].value) {
                    return this.strands[0][type].value;
                } else {
                    return (this.strands[0][type].value + this.strands[1][type].value) / 2;
                }
            } else {
                return this.strands[0][type].value;
            }
        } else {
            if(this.strands[1][type].dominant) {
                return this.strands[1][type].value;
            } else {
                if(this.strands[0][type].value == this.strands[1][type].value) {
                    return this.strands[0][type].value;
                } else {
                    return (this.strands[0][type].value + this.strands[1][type].value) / 2;
                }
            }
        }
    }
}

function dna (chromosomes) {
    this.chromosomes = {}
    for(var key in chromosomes) {
        this.chromosomes[key] = chromosomes[key];
    }
}

dna.prototype = {
    generateRandomData: function() {
        for(var key in this.chromosomes) {
            this.chromosomes[key].generateRandomData();
        }
    },
    meiosis: function() {
        var chromeCopy = cloneObject(this.chromosomes);
        console.log(chromeCopy);
        var daughterObject0 = {};
        var daughterObject1 = {};
        var daughterObject2 = {};
        var daughterObject3 = {};
        for(var key in this.chromosomes) {
            console.log(key);
            daughterObject0[key] = {};
            daughterObject1[key] = {};
            daughterObject2[key] = {};
            daughterObject3[key] = {};
            var crossoverPoint = this.chromosomes[key].numLoci;
            if(Math.random() > 0.5) {
                crossoverPoint = randomInt(0, this.chromosomes[key].numLoci);
                console.log(crossoverPoint);
            }
            var conversionPoints = [0, this.chromosomes[key].numLoci];
            if(Math.random() > 0.5) {
                for(var i = 0; i < 2; i++) {
                    conversionPoints[i] = randomInt(0, this.chromosomes[key].numLoci)
                }
                conversionPoints.sort(function compare(a, b) {
                  if (a is less than b by some ordering criterion)
                     return -1;
                  if (a is greater than b by the ordering criterion)
                     return 1;
                  // a must be equal to b
                  return 0;
                });
                console.log(conversionPoints);
            }
            
            console.log(this.chromosomes[key]);
            for(var locus in this.chromosomes[key].strands[0]) {
                daughterObject0[key][locus] = this.chromosomes[key].strands[0][locus];
            }
            for(var locus in this.chromosomes[key].strands[1]) {
                daughterObject1[key][locus] = this.chromosomes[key].strands[1][locus];
            }
            for(var locus in chromeCopy[key].strands[0]) {
                daughterObject2[key][locus] = chromeCopy[key].strands[0][locus];
            }
            for(var locus in chromeCopy[key].strands[1]) {
                daughterObject3[key][locus] = chromeCopy[key].strands[1][locus];
            }
        }
        
        
        return [daughterObject0, daughterObject1, daughterObject2, daughterObject3];
        
    },
    get: function(key) {
        if(this.chromosomes[key]) {
            return this.chromosomes[key];
        } else {
            for(var chromeKey in this.chromosomes) {
                var keyValue = this.chromosomes[chromeKey].getValue(key);
                if(keyValue != undefined) {
                    return keyValue;
                }
            }
        }
    }
}