const tab3 = (function() {
    let multiCounter = 0;

    const specs = conduitSpecs;

    function populateFractions() {
        const options = `
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
        document.querySelectorAll('.frac-select').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId).value) || 0;
        const frac = parseFloat(document.getElementById(fracId).value) || 0;
        return whole + frac;
    }

    function updateSizeOptions() {
        const conduit = document.getElementById('m-conduit-type').value;
        const sizeSelect = document.getElementById('m-conduit-size');
        const opts = specs[conduit];
        if (!opts) return;
        let html = '';
        for (const sz in opts) {
            html += `<option value="${sz}" data-takeup="${opts[sz].takeup}" data-clr="${opts[sz].clr}">${sz}" (Take-up: ${opts[sz].takeup}", CLR: ${opts[sz].clr}")</option>`;
        }
        sizeSelect.innerHTML = html;
    }

    function addMultiItem() {
        multiCounter++;
        const id = multiCounter;
        const container = document.getElementById('m-bends-container');
        const html = `
            <div class="bend-item" id="m-item-${id}" style="background:#030712; border:1px solid #374151; border-radius:8px; padding:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; color:#60a5fa; margin-bottom:8px;">
                    <span>Гиб #${id}</span>
                    <button class="remove-btn" onclick="document.getElementById('m-item-${id}').remove()" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:4px 10px; cursor:pointer;">Удалить</button>
                </div>
                <div class="form-group">
                    <label>Вид изгиба</label>
                    <select id="m-type-${id}" onchange="tab3.toggleMultiItemInputs(${id})">
                        <option value="stub">90° Stub-up</option>
                        <option value="kick">Kick</option>
                        <option value="offset" selected>Offset</option>
                        <option value="saddle3">3-Point Saddle</option>
                        <option value="saddle4">4-Point Saddle</option>
                    </select>
                </div>
                <div class="form-group" id="m-angle-wrap-${id}">
                    <label>Угол изгиба</label>
                    <select id="m-angle-${id}">
                        <option value="10">10°</option>
                        <option value="22.5">22.5°</option>
                        <option value="30" selected>30°</option>
                        <option value="45">45°</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Позиция / Метка</label>
                    <div class="inch-split">
                        <input type="number" id="m-v1-whole-${id}" value="12" min="0" />
                        <select id="m-v1-frac-${id}" class="frac-select"></select>
                    </div>
                </div>
                <div class="form-group" id="m-group-v2-${id}">
                    <label>Глубина / Подъем</label>
                    <div class="inch-split">
                        <input type="number" id="m-v2-whole-${id}" value="4" min="0" />
                        <select id="m-v2-frac-${id}" class="frac-select"></select>
                    </div>
                </div>
                <div class="form-group" id="m-group-v3-${id}" style="display:none;">
                    <label>Ширина препятствия</label>
                    <div class="inch-split">
                        <input type="number" id="m-v3-whole-${id}" value="6" min="0" />
                        <select id="m-v3-frac-${id}" class="frac-select"></select>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        populateFractions();
        toggleMultiItemInputs(id);
    }

    function toggleMultiItemInputs(id) {
        const type = document.getElementById(`m-type-${id}`).value;
        const angleWrap = document.getElementById(`m-angle-wrap-${id}`);
        const lblV1 = document.getElementById(`m-lbl-v1-${id}`);
        const lblV2 = document.getElementById(`m-lbl-v2-${id}`);
        
        document.getElementById(`m-group-v2-${id}`).style.display = 'block';
        document.getElementById(`m-group-v3-${id}`).style.display = (type === 'saddle4') ? 'block' : 'none';

        if (type === 'stub') {
            document.getElementById(`m-group-v2-${id}`).style.display = 'none';
            angleWrap.style.display = 'none'; // Скрыть выбор угла
            if(lblV1) lblV1.innerText = "Высота стюба от конца трубы";
        } else {
            angleWrap.style.display = 'block'; // Показать выбор угла
            if(type === 'kick') {
                if(lblV1) lblV1.innerText = "Расстояние от конца трубы до центра кика";
                if(lblV2) lblV2.innerText = "Высота кика";
            } else if(type === 'offset') {
                if(lblV1) lblV1.innerText = "Центр препятствия / старт";
                if(lblV2) lblV2.innerText = "Глубина оффсета";
            } else if(type === 'saddle3' || type === 'saddle4') {
                if(lblV1) lblV1.innerText = "Центр препятствия от стены";
                if(lblV2) lblV2.innerText = "Высота препятствия";
            }
        }
    }

    function calculateMultiRun() {
        const sizeSel = document.getElementById('m-conduit-size');
        if (!sizeSel || sizeSel.options.length === 0) {
            alert("Выберите размер трубы для расчёта");
            return;
        }
        const opt = sizeSel.options[sizeSel.selectedIndex];
        const takeup = parseFloat(opt.getAttribute('data-takeup')) || 6;
        const clr = parseFloat(opt.getAttribute('data-clr')) || 4.375;

        const items = document.querySelectorAll('.bend-item');
        const errBox = document.getElementById('m-error-container');
        errBox.innerHTML = '';
        let hasError = false;

        let bends = [];

        if (items.length === 0) {
            errBox.innerHTML = `<div style="color:#ef4444; margin-bottom:12px;">Добавьте хотя бы один гиб.</div>`;
            return;
        }

        items.forEach(item => {
            const id = item.id.replace('m-item-', '');
            const type = document.getElementById(`m-type-${id}`).value;
            const v1 = getSplitVal(`m-v1-whole-${id}`, `m-v1-frac-${id}`);
            const v2 = getSplitVal(`m-v2-whole-${id}`, `m-v2-frac-${id}`);
            const v3 = getSplitVal(`m-v3-whole-${id}`, `m-v3-frac-${id}`);

            let angle, rad, multiplier, shrink, centerCorr;
            if (type === 'stub') {
                angle = 90; 
            } else {
                angle = parseFloat(document.getElementById(`m-angle-${id}`).value) || 30;
            }

            rad = angle * Math.PI / 180;
            multiplier = 1 / Math.sin(rad);
            shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
            centerCorr = clr * Math.tan(rad / 2);

            let minM = 0, maxM = 0, details = {};
            if (type === 'stub') {
                minM = v1 - takeup;
                maxM = v1;
                details = { title: '90° Стюб', desc: `Метка: ${formatInches(minM)}` };
            } else if (type === 'kick') {
                const m1 = v1 - shrink - centerCorr;
                const m2 = m1 + v2 * multiplier;
                minM = m1; maxM = m2;
                details = { title: `Kick (${angle}°)`, desc: `М1=${formatInches(m1)}, М2=${formatInches(m2)}` };
            } else if (type === 'offset') {
                const m1 = v1 + shrink - centerCorr;
                const m2 = m1 + v2 * multiplier;
                minM = m1; maxM = m2;
                details = { title: `Offset (${angle}°)`, desc: `М1=${formatInches(m1)}, М2=${formatInches(m2)}` };
            } else if (type === 'saddle3') {
                const dist = v2 * multiplier;
                const saddleShrink = 2 * shrink;
                const m2 = v1 + saddleShrink;
                const m1 = m2 - dist - centerCorr;
                const m3 = m2 + dist + centerCorr;
                minM = m1; maxM = m3;
                details = { title: `Saddle 3 точки`, desc: `М1=${formatInches(m1)}, Центр=${formatInches(m2)}, М3=${formatInches(m3)}` };
            } else if (type === 'saddle4') {
                const totalShrink = 2 * shrink;
                const adjCenter = v1 + totalShrink;
                const dist = v2 * multiplier;
                const m2 = adjCenter - v3 / 2;
                const m3 = adjCenter + v3 / 2;
                const m1 = m2 - dist - centerCorr;
                const m4 = m3 + dist + centerCorr;
                minM = m1; maxM = m4;
                details = { title: `Saddle 4 точки`, desc: `М1=${formatInches(m1)}, М2=${formatInches(m2)}, М3=${formatInches(m3)}, М4=${formatInches(m4)}` };
            }
            bends.push({ id, minM, maxM, details });
        });

        bends.sort((a, b) => a.minM - b.minM);
        for (let i = 0; i < bends.length -1; i++) {
            if (bends[i+1].minM < bends[i].maxM + 1.0) {
                hasError = true;
                document.getElementById(`m-item-${bends[i].id}`).style.borderColor = "#ef4444";
                document.getElementById(`m-item-${bends[i+1].id}`).style.borderColor = "#ef4444";
                errBox.innerHTML += `<div style="color:#ef4444;">Ошибка: Гиб #${bends[i].id} накладывается на гиб #${bends[i+1].id}. Увеличьте расстояния.</div>`;
            }
        }

        if (hasError) {
            document.getElementById('m-results').style.display = 'none';
            document.getElementById('m-instructions').style.display = 'none';
            return;
        } else {
            bends.forEach(b => {
                const el = document.getElementById(`m-item-${b.id}`);
                if(el) el.style.borderColor = "#374151";
            });
        }

        let resHtml = `<h3>Таблица меток:</h3>`;
        let instrHtml = `<h4>Инструкции:</h4><ol>`;
        bends.forEach((b, idx) => {
            resHtml += `<div><b>Гиб #${idx+1} (${b.details.title}):</b> ${b.details.desc}</div>`;
            instrHtml += `<li><b>Гиб #${idx+1}:</b> Нанесите метки и сделайте гиб в порядке.</li>`;
        });
        instrHtml += `</ol>`;

        const resDiv = document.getElementById('m-results');
        const insDiv = document.getElementById('m-instructions');

        resDiv.style.display = 'block';
        resDiv.innerHTML = resHtml;

        insDiv.style.display = 'block';
        insDiv.innerHTML = instrHtml;
    }

    function init() {
        updateSizeOptions();
        addMultiItem();
        addMultiItem();

        document.getElementById('m-conduit-type').addEventListener('change', updateSizeOptions);
    }

    return {
        init,
        updateSizeOptions,
        addMultiItem,
        toggleMultiItemInputs,
        calculateMultiRun
    };
})();
