const ConduitMath = {
    toRad(deg) {
        return deg * Math.PI / 180;
    },

    getMultiplier(angleDeg) {
        return 1 / Math.sin(this.toRad(angleDeg));
    },

    getShrink(depth, angleDeg) {
        const rad = this.toRad(angleDeg);
        return depth * ((1 - Math.cos(rad)) / Math.sin(rad));
    },

    getCenterShift(clr, angleDeg) {
        const rad = this.toRad(angleDeg);
        return clr * Math.tan(rad / 2);
    },

    calcStub(targetHeight, takeup) {
        return targetHeight - takeup;
    },

    calcOffset(v1, v2, angleDeg, takeup, clr) {
        const rad = this.toRad(angleDeg);
        const multiplier = 1 / Math.sin(rad);
        const shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
        const centerShift = clr * Math.tan(rad / 2);
        
        const m1 = v1 + shrink - centerShift;
        const dist = v2 * multiplier;
        const m2 = m1 + dist;
        return { m1, m2, shrink, dist, centerShift };
    },

    calcSaddle3(v1, v2, angleDeg, clr) {
        const rad = this.toRad(angleDeg);
        const multiplier = 1 / Math.sin(rad);
        const shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
        const centerShift = clr * Math.tan(rad / 2);
        
        const saddleShrink = 2 * shrink;
        const m2 = v1 + saddleShrink;
        const dist = v2 * multiplier;
        const m1 = m2 - dist - centerShift;
        const m3 = m2 + dist + centerShift;
        return { m1, m2, m3, saddleShrink, dist };
    },

    calcSaddle4(v1, v2, obstacleWidth, angleDeg, clr) {
        const rad = this.toRad(angleDeg);
        const multiplier = 1 / Math.sin(rad);
        const shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
        const centerShift = clr * Math.tan(rad / 2);

        const totalShrink = 2 * shrink;
        const adjCenter = v1 + totalShrink;
        const dist = v2 * multiplier;
        const halfWidth = obstacleWidth / 2;

        const m2 = adjCenter - halfWidth;
        const m3 = adjCenter + halfWidth;
        const m1 = m2 - dist - centerShift;
        const m4 = m3 + dist + centerShift;
        return { m1, m2, m3, m4, dist };
    }
};

function formatInches(value) {
    if (isNaN(value)) return '0"';
    const inches = Math.floor(value);
    const remainder = value - inches;
    const fractions = [
        { val: 0, str: '' },
        { val: 0.0625, str: '1/16"' },
        { val: 0.125, str: '1/8"' },
        { val: 0.1875, str: '3/16"' },
        { val: 0.25, str: '1/4"' },
        { val: 0.3125, str: '5/16"' },
        { val: 0.375, str: '3/8"' },
        { val: 0.4375, str: '7/16"' },
        { val: 0.5, str: '1/2"' },
        { val: 0.5625, str: '9/16"' },
        { val: 0.625, str: '5/8"' },
        { val: 0.6875, str: '11/16"' },
        { val: 0.75, str: '3/4"' },
        { val: 0.8125, str: '13/16"' },
        { val: 0.875, str: '7/8"' },
        { val: 0.9375, str: '15/16"' },
        { val: 1.0, str: '1"' }
    ];

    let closest = fractions[0];
    let minDiff = Math.abs(remainder - closest.val);
    for (let i = 1; i < fractions.length; i++) {
        let diff = Math.abs(remainder - fractions[i].val);
        if (diff < minDiff) {
            minDiff = diff;
            closest = fractions[i];
        }
    }

    if (closest.val === 1.0) return `${inches + 1}"`;
    if (inches === 0 && closest.str === '') return '0"';
    if (inches === 0) return closest.str;
    if (closest.str === '') return `${inches}"`;
    return `${inches} ${closest.str}`;
}