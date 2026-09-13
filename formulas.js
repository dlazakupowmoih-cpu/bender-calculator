const BEND_CONSTANTS = {
    10:    { multiplier: 5.759,  shrinkPerInch: 0.087,  centerShiftFactor: 0.087 },
    15:    { multiplier: 3.864,  shrinkPerInch: 0.132,  centerShiftFactor: 0.132 },
    22.5:  { multiplier: 2.613,  shrinkPerInch: 0.199,  centerShiftFactor: 0.198 },
    30:    { multiplier: 2.000,  shrinkPerInch: 0.268,  centerShiftFactor: 0.268 },
    45:    { multiplier: 1.414,  shrinkPerInch: 0.414,  centerShiftFactor: 0.414 },
    60:    { multiplier: 1.155,  shrinkPerInch: 0.577,  centerShiftFactor: 0.577 }
};

const ConduitMath = {
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

    // 1. Одиночный (Offset)
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
                `<b>Первая отметка (M1):</b> Ставить на расстоянии <b>${this.formatInches(m1)}</b> от конца трубы.`,
                `<b>Вторая отметка (M2):</b> Отмерь от M1 расстояние <b>${this.formatInches(dist)}</b>.`,
                `<b>Гибка:</b> Первый гиб на M1 под углом ${angleDeg}°. Второй гиб на M2 в ту же сторону.`
            ]
        };
    },

    // 2. Кик (Kick) — длина трубы и градусы
    calcKick(v1, v2, angleDeg, takeup) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const m1 = v1 + shrink;
        const totalLength = m1 + takeup + 12; // Общая разумная длина трубы для отреза

        return {
            marks: [
                { label: 'Метка гиба кика (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Требуемый угол гиба', value: angleDeg, formatted: `${angleDeg}°` },
                { label: 'Рекомендуемая длина заготовки', value: totalLength, formatted: this.formatInches(totalLength) }
            ],
            steps: [
                `Усадка на кик высотой <b>${this.formatInches(v2)}</b> под углом <b>${angleDeg}°</b> составляет <b>${this.formatInches(shrink)}</b>.`,
                `<b>Метка:</b> Отмерь от торца трубы <b>${this.formatInches(m1)}</b> и поставь отметку.`,
                `<b>Гибка:</b> Заряди трубу в бендер (стрелкой к торцу) и согни ровно на <b>${angleDeg}°</b>.`,
                `Итоговая минимальная длина трубы для работы должна быть не менее <b>${this.formatInches(totalLength)}</b>.`
            ]
        };
    },

    // 3. Multi-Run (Расчет смещений для группы труб с индивидуальным шагом)
    calcMultiRun(v1, v2, angleDeg, takeup, clr, totalPipes, spacing) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        const rad = angleDeg * Math.PI / 180;
        const tanVal = 1 / Math.tan(rad);
        const dist = v2 * bend.multiplier;

        let pipesResult = [];
        for (let i = 0; i < totalPipes; i++) {
            // Каждая последующая труба смещается по гипотенузе/шагу
            const extraPull = i * spacing * tanVal;
            const m1 = v1 + shrink - centerShift + extraPull;
            const m2 = m1 + dist;

            pipesResult.push({
                pipeNum: i + 1,
                m1: this.formatInches(m1),
                m2: this.formatInches(m2)
            });
        }

        let marksList = pipesResult.map(p => ({
            label: `Труба #${p.pipeNum}`,
            value: 0,
            formatted: `M1 = ${p.m1} | M2 = ${p.m2}`
        }));

        return {
            marks: marksList,
            steps: [
                `Количество труб в пакете: <b>${totalPipes}</b> с шагом осей <b>${this.formatInches(spacing)}</b>.`,
                `Угол офсета: <b>${angleDeg}°</b>. Базовое расстояние между метками (гибами): <b>${this.formatInches(dist)}</b>.`,
                `Используй разметку выше для каждой отдельной трубы в ряду, чтобы они идеально легли параллельно.`
            ]
        };
    },

    // 4. Параллельный ран (Parallel Run - расчет смещения конкретной трубы в ряду)
    calcParallelOffset(v1, v2, angleDeg, takeup, clr, pipeIndex, spacing) {
        const bend = BEND_CONSTANTS[angleDeg] || BEND_CONSTANTS[30];
        const shrink = v2 * bend.shrinkPerInch;
        const centerShift = clr * bend.centerShiftFactor;
        
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
                `<b>Параллельный ран (Труба #${pipeIndex + 1}):</b> Шаг осей: <b>${this.formatInches(spacing)}</b>.`,
                `<b>Первая отметка (M1):</b> Поставь метку на расстоянии <b>${this.formatInches(m1)}</b>.`,
                `<b>Вторая отметка (M2):</b> Отмерь от M1 расстояние <b>${this.formatInches(dist)}</b>.`,
                `<b>Гибка:</b> Гни оба гиба под углом <b>${angleDeg}°</b> в одной плоскости.`
            ]
        };
    }
};
