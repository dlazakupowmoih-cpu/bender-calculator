const ConduitMath = {
    toRad(deg) {
        return deg * Math.PI / 180;
    },

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

    // Расчет Stub-up (обычный вертикальный подъем)
    calcStub(targetHeight, takeup) {
        const result = targetHeight - takeup;
        return {
            marks: [{ label: 'Точка гиба', value: result, formatted: this.formatInches(result) }],
            steps: [
                `Отмерь от конца трубы общую высоту: <b>${this.formatInches(targetHeight)}</b>.`,
                `Вычти takeup бендера для этого размера: <b>${this.formatInches(takeup)}</b>.`,
                `Поставь отметку на расстоянии <b>${this.formatInches(result)}</b> от конца трубы.`,
                `Заряди трубу в трубогиб стрелкой к концу и гни до упора.`
            ]
        };
    },

    // Расчет Offset (смещение / кик)
    calcOffset(v1, v2, angleDeg, takeup, clr) {
        const rad = this.toRad(angleDeg);
        const multiplier = 1 / Math.sin(rad);
        const shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
        const centerShift = clr * Math.tan(rad / 2);
        
        const m1 = v1 + shrink - centerShift;
        const dist = v2 * multiplier;
        const m2 = m1 + dist;

        return {
            marks: [
                { label: 'Первая отметка (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Вторая отметка (M2)', value: m2, formatted: this.formatInches(m2) }
            ],
            steps: [
                `Базовая отметка от конца трубы: <b>${this.formatInches(v1)}</b>. Усадка с учетом угла: <b>${this.formatInches(shrink)}</b>.`,
                `<b>Первая отметка (M1):</b> Поставь метку на расстоянии <b>${this.formatInches(m1)}</b> от конца трубы.`,
                `<b>Вторая отметка (M2):</b> Отмерь от первой метки M1 расстояние <b>${this.formatInches(dist)}</b> (дистанция между гибами) и поставь вторую метку.`,
                `<b>Гибка:</b> Согни первый гиб на M1 под углом ${angleDeg}°. Переверни трубу и согни второй гиб на M2 в ту же сторону.`
            ]
        };
    },

    // Расчет 3-точечного сэдла (3-Point Saddle)
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
        const centerAngle = angleDeg * 2;

        return {
            marks: [
                { label: 'Левая отметка (M1)', value: m1, formatted: this.formatInches(m1) },
                { label: 'Центральная отметка (M2)', value: m2, formatted: this.formatInches(m2) },
                { label: 'Правая отметка (M3)', value: m3, formatted: this.formatInches(m3) }
            ],
            steps: [
                `<b>Центр препятствия:</b> Базовая точка на трубе: <b>${this.formatInches(v1)}</b>. Общая усадка сэдла: <b>${this.formatInches(saddleShrink)}</b>.`,
                `<b>Центр (M2):</b> Поставь центральную отметку на расстоянии <b>${this.formatInches(m2)}</b> от конца.`,
                `<b>Боковые точки (M1 и M3):</b> Отмерь от центра M2 расстояние <b>${this.formatInches(dist)}</b> в обе стороны с учетом поправки центра.`,
                `<b>Гибка:</b> Центральный гиб на M2 гни под углом <b>${centerAngle}°</b>. Боковые гибы на M1 и M3 — под углом <b>${angleDeg}°</b> в противоположную сторону.`
            ]
        };
    }
};
