var alleleDominance = {
    velocity: {
        type: "loHi",
        low: true,
        high: false,
    },
    pathConfidence: {
        type: "loMedHi",
        low: true,
        medium: false,
        high: false
    },
    angleConfidence: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    velocityConfidence: {
        type: "loHi",
        low: false,
        high: true
    },
    senseRadius: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: true
    },
    caresAboutObjects: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    objectAffectsVelocity: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    velocityObjectEffect: {
        type: "loHi",
        low: true,
        high: false
    },
    objectAffectsDirectionalBias: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    directionalBiasObjectEffect: {
        type: "loHi",
        low: true,
        high: false
    },
    objectAffectsVelocityConfidence: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    velocityConfidenceObjectEffect: {
        type: "loHi",
        low: true,
        high: false
    },
    objectAffectsAngleConfidence: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    angleConfidenceObjectEffect: {
        type: "loHi",
        low: false,
        high: true
    },
    objectAffectsPathConfidence: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    pathConfidenceObjectEffect: {
        type: "loHi",
        low: false,
        high: true
    },
    tailLength: {
        type: "loHi",
        low: false,
        high: true
    }, 
    directionalBias: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    }, 
    velocityBias: {
        type: "loMedHi",
        low: false,
        medium: true,
        high: false
    },
    size: {
        type: "loMedHi",
        low: true,
        medium: true,
        high: false
    },
    colourVariation: {
        type: "loMedHi",
        low: true,
        medium: false,
        high: true
    },
    stripy: {
        type: "onOff",
        on: true,
        off: false
    },
    red: {
        type: "loHi",
        low: false,
        high: true
    }, 
    green: {
        type: "loHi",
        low: false,
        high: true
    },
    blue: {
        type: "loHi",
        low: false,
        high: true
    }
}