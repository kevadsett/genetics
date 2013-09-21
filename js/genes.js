function Allele(type, value, dominant) {
    this.type = type;
    this.value = value;
    this.dominant = dominant;
}

Allele.prototype = {
    generateRandomData: function() {
        this.value = Math.random();
        this.dominant = Math.random() >= 0.5;
    }
}

function Chromosome(types) {
    this.strands = new Array(2);
    this.loci = {};
    for(var i = 0; i < types.length; i++) {
        this.loci[types[i]] = new Allele(types[i]);
    }
    this.strands[0] = this.loci;
    this.strands[1] = cloneObject(this.loci);
}

Chromosome.prototype = {
    generateRandomData: function() {
        for(var i = 0; i < 2; i++) {
            for(var key in this.strands[i]) {
                this.strands[i][key].generateRandomData()
            }
        }
    },
    getValue:function(type) {
        if(this.strand[0][type].dominant) {
            if(this.strand[1][type].dominant) {
                return (this.strand[0][type].value + this.strand[1][type].value)/2;
            } else {
                this.strand[0][type].value;
            }
        } else {
            if(this.strand[1][type].dominant) {
                return this.strand[1][type].value;
            } else {
                this.strand[0][type].value;
            }
        }
    },
    meiosis: function() {
        
    }
}