// Полевые константы для стандартных углов гибки
const BEND_CONSTANTS = {
    10:    { multiplier: 5.759,  shrinkPerInch: 0.087,  centerShiftFactor: 0.087 },
    15:    { multiplier: 3.864,  shrinkPerInch: 0.132,  centerShiftFactor: 0.132 },
    22.5:  { multiplier: 2.613,  shrinkPerInch: 0.199,  centerShiftFactor: 0.198 },
    30:    { multiplier: 2.000,  shrinkPerInch: 0.268,  centerShiftFactor: 0.268 },
    45:    { multiplier: 1.414,  shrinkPerInch: 0.414,  centerShiftFactor: 0.414 },
    60:    { multiplier: 1.155,  shrinkPerInch: 0.577,  centerShiftFactor: 0.577 }
};

const ConduitMath = {
    // Форматирование десятичных дюймов в строительные дроби (шаг 1/16")
    formatInches(value) {
        if (isNaN(value) || value < 0) return '0"';
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
    },

    calcStub(targetHeight, takeup) {
        const result = targetHeight - takeup;
        return {
            marks: [{ label: 'Точка гиба', value: result, formatted: this.formatInches(result) }],
            steps: [
                `Отмерь от конца трубы нужную высоту: <b>${this.formatInches(targetHeight)}</b>.`,
                `Вычти takeup бендера: <b>${this.formatInches(takeup)}</b>.`,
                `Поставь отметку на расстоянии <b>${this.formatInches(result)}</b> от конца трубы.`,
                `Заряди трубу в трубогиб стрелкой к концу и гни до упора.`
            ]
        };
    },

    calcOffset(v1, v2, angleDeg, takeup, clr) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        
        const m1 = v1 + shrink - centerShift;
        const dist = v2 * bend.multiplier;
        const m2 = m1 + dist;

        return {
            marks: [
                { label: 'Первая отметка (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Вторая отметка (M2)', value: m2, formatted: this.formatInches(m2) }
            ],
            steps: [
                `Базовая отметка: <b>${this.formatInches(v1)}</b>. Усадка (${angleDeg}°): <b>${this.formatInches(shrink)}</b>.`,
                `<b>Первая отметка (M1):</b> Поставь метку на расстоянии <b>${this.formatInches(m1)}</b> от конца трубы.`,
                `<b>Вторая отметка (M2):</b> Отмерь от M1 расстояние <b>${this.formatInches(dist)}</b> и поставь вторую метку.`,
                `<b>Гибка:</b> Первый гиб на M1 под углом ${angleDeg}°. Второй гиб на M2 в ту же сторону.`
            ]
        };
    },

    calcKick(v1, v2, angleDeg, takeup, clr) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        const m1 = v1 + shrink - centerShift;

        return {
            marks: [
                { label: 'Отметка кика (M1)', value: m1, formatted: this.formatInches(m1) }
            ],
            steps: [
                `Базовая отметка: <b>${this.formatInches(v1)}</b>. Усадка: <b>${this.formatInches(shrink)}</b>.`,
                `<b>Отметка (M1):</b> Поставь метку на расстоянии <b>${this.formatInches(m1)}</b> от конца.`,
                `<b>Гибка:</b> Согни трубу на отметке M1 под углом <b>${angleDeg}°</b>.`
            ]
        };
    },

    calcParallelOffset(v1, v2, angleDeg, takeup, clr, pipeIndex, spacing) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        
        // Для параллельных труб берем шаг через тангенс угла
        const rad = angleDeg * Math.PI / 180;
        const m1 = v1 + shrink - centerShift + (pipeIndex * spacing * (1 / Math.tan(rad)));
        const dist = v2 * bend.multiplier;
        const m2 = m1 + dist;

        return {
            marks: [
                { label: `Труба #${pipeIndex + 1} — Метка M1`, value: m1, formatted: this.formatInches(m1) },
                { label: `Труба #${pipeIndex + 1} — Метка M2`, value: m2, formatted: this.formatInches(m2) }
            ],
            steps: [
                `<b>Параллельный ряд (Труба #${pipeIndex + 1}):</b> Шаг осей: <b>${this.formatInches(spacing)}</b>.`,
                `<b>Первая отметка (M1):</b> Поставь метку на расстоянии <b>${this.formatInches(m1)}</b>.`,
                `<b>Вторая отметка (M2):</b> Отмерь от M1 расстояние <b>${this.formatInches(dist)}</b>.`,
                `<b>Гибка:</b> Гни оба гиба под углом <b>${angleDeg}°</b> в одной плоскости.`
            ]
        };
    },

    calcSaddle3(v1, v2, angleDeg, clr) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        
        const saddleShrink = 2 * shrink;
        const m2 = v1 + saddleShrink; 
        const dist = v2 * bend.multiplier;
        const m1 = m2 - dist - centerShift; 
        const m3 = m2 + dist + centerShift; 
        const centerAngle = angleDeg * 2;

        return {
            marks: [
                { label: 'Левая отметка (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Центральная отметка (M2)', value: m2, formatted: this.formatInches(m2) },
                { label: 'Правая отметка (M3)', value: m3, formatted: this.formatInches(m3) }
            ],
            steps: [
                `<b>Центр препятствия:</b> Базовая точка: <b>${this.formatInches(v1)}</b>. Усадка сэдла: <b>${this.formatInches(saddleShrink)}</b>.`,
                `<b>Центр (M2):</b> Поставь отметку на расстоянии <b>${this.formatInches(m2)}</b>.`,
                `<b>Боковые точки (M1 и M3):</b> Отмерь от центра M2 расстояние <b>${this.formatInches(dist)}</b> в обе стороны.`,
                `<b>Гибка:</b> Центр (M2) — угол <b>${centerAngle}°</b>. Боковые (M1, M3) — угол <b>${angleDeg}°</b> в противоположную сторону.`
            ]
        };
    },

    calcSaddle4(v1, v2, obstacleWidth, angleDeg, clr) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;

        const totalShrink = 2 * shrink;
        const adjCenter = v1 + totalShrink;
        const dist = v2 * bend.multiplier;
        const halfWidth = obstacleWidth / 2;

        const m2 = adjCenter - halfWidth;
        const m3 = adjCenter + halfWidth;
        const m1 = m2 - dist - centerShift;
        const m4 = m3 + dist + centerShift;

        return {
            marks: [
                { label: 'Внешняя левая (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Внутренняя левая (M2)', value: m2, formatted: this.formatInches(m2) },
                { label: 'Внутренняя правая (M3)', value: m3, formatted: this.formatInches(m3) },
                { label: 'Внешняя правая (M4)', value: m4, formatted: this.formatInches(m4) }
            ],
            steps: [
                `<b>Препятствие:</b> Центр: <b>${this.formatInches(v1)}</b>, ширина: <b>${this.formatInches(obstacleWidth)}</b>. Усадка: <b>${this.formatInches(totalShrink)}</b>.`,
                `<b>Внутренние гибы (M2, M3):</b> Отмерь края препятствия от скорректированного центра.`,
                `<b>Внешние гибы (M1, M4):</b> Отложи расстояние <b>${this.formatInches(dist)}</b> наружу от точек M2 и M3.`,
                `<b>Гибка:</b> Выполни все 4 гиба под углом <b>${angleDeg}°</b>.`
            ]
        };
    }
};
