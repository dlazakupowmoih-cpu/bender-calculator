const tab1 = (function() {
    const specs = conduitSpecs;

    function populateFractions() {
        const fracSelects = ['s-v1-frac', 's-v2-frac', 's-v3-frac'];
        fracSelects.forEach(id => {
            const sel = document.getElementById(id);
            if (sel) sel.innerHTML = `
                <option value="0">0</option>
                <option value="0.0625">1/16"</option>
                <option value="0.125">1/8"</option>
                <option value="0.1875">3/16"</option>
                <option value="0.25">1/4"</option>
                <option value="0.3125">5/16"</option>
                <option value="0.375">3/8"</option>
                <option value="0.4375">7/16"</option>
                <option value="0.5">1/2"</option>
                <option value="0.5625">9/16"</option>
                <option value="0.625">5/8"</option>
                <option value="0.6875">11/16"</option>
                <option value="0.75">3/4"</option>
                <option value="0.8125">13/16"</option>
                <option value="0.875">7/8"</option>
                <option value="0.9375">15/16"</option>
            `;
        });
    }

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId).value) || 0;
        const frac = parseFloat(document.getElementById(fracId).value) || 0;
        return whole + frac;
    }

    function formatInches(val) {
        return window.formatInches(val);
    }

    function updateSizeOptions() {
        const conduitType = document.getElementById('s-conduit-type').value;
        const sizeSelect = document.getElementById('s-conduit-size');
        const options = specs[conduitType];
        if (!options) return;
        let html = '';
        for (const size in options) {
            const takeup = options[size].takeup;
            const clr = options[size].clr;
            html += `<option value="${size}" data-takeup="${takeup}" data-clr="${clr}">${size}" (Take-up: ${takeup}", CLR: ${clr}")</option>`;
        }
        sizeSelect.innerHTML = html;
    }

    function toggleSingleInputs() {
        const type = document.getElementById('s-bend-type').value;
        const val2Group = document.getElementById('s-val2-group');
        const val3Group = document.getElementById('s-val3-group');
        const angleGroup = document.getElementById('s-angle-group-container');

        val2Group.style.display = 'block';
        val3Group.style.display = 'none';
        angleGroup.style.display = (type === 'stub') ? 'none' : 'block';

        if (type === 'stub') val2Group.style.display = 'none';
        if (type === 'saddle4') val3Group.style.display = 'block';
    }

    function handleSingleAngleChange() {
        const sel = document.getElementById('s-bend-angle');
        const customSliderWrap = document.getElementById('s-custom-slider-wrap');
        if (sel.value === 'custom') {
            customSliderWrap.style.display = 'block';
        } else {
            customSliderWrap.style.display = 'none';
        }
    }

    function syncSingleSlider(val) {
        document.getElementById('s-custom-num').value = val;
        document.getElementById('s-slider-val-lbl').innerText = val;
    }

    function syncSingleNum(val) {
        document.getElementById('s-custom-slider').value = val;
        document.getElementById('s-slider-val-lbl').innerText = val;
    }

    function getSingleAngle() {
        const sel = document.getElementById('s-bend-angle');
        if (sel.value === 'custom') {
            const val = parseFloat(document.getElementById('s-custom-num').value);
            return (val && val > 0) ? val : 30;
        }
        return parseFloat(sel.value);
    }

    function calculateSingleBend() {
        const sizeSel = document.getElementById('s-conduit-size');
        if (sizeSel.options.length === 0) {
            alert('Выберите размер трубы');
            return;
        }
        const opt = sizeSel.options[sizeSel.selectedIndex];
        const takeup = parseFloat(opt.getAttribute('data-takeup')) || 6;
        const clr = parseFloat(opt.getAttribute('data-clr')) || 4.375;

        const type = document.getElementById('s-bend-type').value;
        const val1 = getSplitVal('s-v1-whole', 's-v1-frac');
        const val2 = getSplitVal('s-v2-whole', 's-v2-frac');
        const val3 = getSplitVal('s-v3-whole', 's-v3-frac');

        let resHtml = `<div>⚙️ Параметры головки: Take-up = <b>${takeup}"</b> | Радиус загиба (CLR) = <b>${clr}"</b></div>`;
        let instrHtml = '';

        if (type === 'stub') {
            const mark = val1 - takeup;
            resHtml += `<h3>📏 Куда ставить метку:</h3><div>Риску ставим на <b>${formatInches(mark)}</b> от торца трубы.</div>`;
            instrHtml += `<h4>Инструкции:</h4><ol>
                <li>Отмерьте расстояние ${formatInches(mark)} и поставьте метку.</li>
                <li>Вставьте трубу в трубогиб так, чтоб метка совпала со стрелкой.</li>
                <li>Согните до 90°.</li>
            </ol>`;
        } else {
            const angleDeg = getSingleAngle();
            const rad = angleDeg * Math.PI / 180;
            const multiplier = 1 / Math.sin(rad);
            const shrink = val2 * ((1 - Math.cos(rad)) / Math.sin(rad));
            const centerShift = clr * Math.tan(rad / 2);

            if (type === 'saddle3') {
                const dist = val2 * multiplier;
                const saddleShrink = 2 * shrink;
                const m2 = val1 + saddleShrink;
                const m1 = m2 - dist - centerShift;
                const m3 = m2 + dist + centerShift;
                resHtml += `<div>Усадка трубы (Shrink): <b>${formatInches(saddleShrink)}</b></div>
                            <div>Метки: М1 = <b>${formatInches(m1)}</b>, М2 (центр) = <b>${formatInches(m2)}</b>, М3 = <b>${formatInches(m3)}</b></div>`;
                instrHtml += `<h4>Инструкции:</h4><ol>
                    <li>Поставьте метки на расстояниях М1, М2, М3.</li>
                    <li>Согните по центральной М2 на угол ${angleDeg * 2}°.</li>
                    <li>Переверните трубу и согните М1 и М3 на ${angleDeg}°.</li>
                </ol>`;
            } else if (type === 'saddle4') {
                const totalShrink = 2 * shrink;
                const adjCenter = val1 + totalShrink;
                const dist = val2 * multiplier;
                const halfWidth = val3 / 2;
                const m2 = adjCenter - halfWidth;
                const m3 = adjCenter + halfWidth;
                const m1 = m2 - dist - centerShift;
                const m4 = m3 + dist + centerShift;
                resHtml += `<div>Метки: М1 = <b>${formatInches(m1)}</b>, М2 = <b>${formatInches(m2)}</b>, М3 = <b>${formatInches(m3)}</b>, М4 = <b>${formatInches(m4)}</b></div>`;
                instrHtml += `<h4>Инструкции:</h4><ol>
                    <li>Поставьте метки М1, М2, М3, М4.</li>
                    <li>Делайте сгибы по очереди на этих точках.</li>
                </ol>`;
            } else {
                const dist = val2 * multiplier;
                const m1 = val1 + shrink - centerShift;
                const m2 = m1 + dist;
                resHtml += `<div>Метка 1 (М1) = <b>${formatInches(m1)}</b>, Метка 2 (М2) = <b>${formatInches(m2)}</b></div>`;
                instrHtml += `<h4>Инструкции:</h4><ol>
                    <li>Поставьте метки М1 и М2.</li>
                    <li>Согните трубу на М1 под углом ${angleDeg}°.</li>
                    <li>Поверните трубу и согните по М2 под таким же углом.</li>
                </ol>`;
            }
        }

        const resDiv = document.getElementById('s-results');
        resDiv.style.display = 'block';
        resDiv.innerHTML = resHtml;

        const instrDiv = document.getElementById('s-instructions');
        instrDiv.style.display = 'block';
        instrDiv.innerHTML = instrHtml;
    }

    function init() {
        populateFractions();
        updateSizeOptions();
        toggleSingleInputs();

        document.getElementById('s-bend-angle').addEventListener('change', handleSingleAngleChange);
        document.getElementById('s-conduit-type').addEventListener('change', updateSizeOptions);
        document.getElementById('s-bend-type').addEventListener('change', toggleSingleInputs);
    }

    return {
        init,
        updateSizeOptions,
        toggleSingleInputs,
        handleSingleAngleChange,
        syncSingleSlider,
        syncSingleNum,
        calculateSingleBend
    };
})();
