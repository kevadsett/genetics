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
        console.log(type);
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
        for(var key in this.chromosomes) {
            console.log(key);
        }
    },
    get: function(key) {
        console.log("get: " + key);
        if(this.chromosomes[key]) {
            return this.chromosomes[key];
        } else {
            for(var chromeKey in this.chromosomes) {
                console.log(this.chromosomes[chromeKey]);
                if(this.chromosomes[chromeKey].getValue(key) != undefined) {
                    return this.chromosomes[chromeKey].getValue(key);
                }
            }
        }
    }
}