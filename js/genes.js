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
    populateData: function(strand1, strand2) {
        this.strands[0] = cloneObject(strand1);
        this.strands[1] = cloneObject(strand2);
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
    },
    crossover: function() {
        var resultingChromosome = cloneObject(this);
        var crossoverPoint = this.loci.length;
        if(Math.random() > 0.5) {
            crossoverPoint = randomInt(0, this.loci.length);
        } else {
            return resultingChromosome;
        }
        
        for(var i = 0; i < this.loci.length; i++) {
            var type = this.loci[i];
            var alleles = [cloneObject(resultingChromosome.strands[0][type]), cloneObject(resultingChromosome.strands[1][type])];
            if(i >= crossoverPoint) {
                resultingChromosome.strands[0][type] = alleles[1];
                resultingChromosome.strands[1][type] = alleles[0];
            }
        }
        return resultingChromosome;
    },
    conversion: function() {
        var resultingChromosome = cloneObject(this);
        var conversionPoints = [0, this.loci.length];
        if(Math.random() > 0.5) {
            for(var i = 0; i < 2; i++) {
                conversionPoints[i] = randomInt(0, this.loci.length)
            }
            conversionPoints.sort(function compare(a, b) {
              if (a < b) return -1;
              if (a > b) return 1;
              return 0;
            });
            if(conversionPoints[0] == conversionPoints[1]){
                return resultingChromosome;
            }
        } else {
            return resultingChromosome;
        }
        
        
        for(var i = 0; i < this.loci.length; i++) {
            var type = this.loci[i];
            var alleles = [resultingChromosome.strands[0][type], resultingChromosome.strands[1][type]];
            if(i >= conversionPoints[0] && i < conversionPoints[1]) {
                resultingChromosome.strands[0][type] = alleles[1];
                resultingChromosome.strands[1][type] = alleles[0];
            }
        }
        return resultingChromosome;
    },
    mutation: function() {
        var resultingChromosome = cloneObject(this);
        // TODO
        return resultingChromosome;
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
        var chromeCopies = [cloneObject(this.chromosomes), cloneObject(this.chromosomes)];
        var daughterCells = [{},{},{},{}];
        for(var i = 0; i < chromeCopies.length; i++) {
            for(var key in chromeCopies[i]) {
                chromeCopies[i][key] = chromeCopies[i][key].crossover().conversion().mutation();
                daughterCells[0][key] = chromeCopies[0][key].strands[0];
                daughterCells[1][key] = chromeCopies[0][key].strands[1];
                daughterCells[2][key] = chromeCopies[1][key].strands[0];
                daughterCells[3][key] = chromeCopies[1][key].strands[1];
            }
        }
        for(var key in chromeCopies[i]) {
            
        }
        return daughterCells;
        
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

function makeABaby(parent1, parent2) {
    var parent1Cells = parent1.genes.meiosis(),
        parent2Cells = parent2.genes.meiosis(),
        babyChromosomes = {},
        seeds = [randomInt(0,4), randomInt(0,4)];
    for(var key in parent1.genes.chromosomes) {
        babyChromosomes[key] = new Chromosome(parent1.genes.chromosomes[key].loci);
        babyChromosomes[key].populateData(parent1Cells[seeds[0]][key], parent1Cells[seeds[1]][key]);
    }
    return new dna(babyChromosomes);
}