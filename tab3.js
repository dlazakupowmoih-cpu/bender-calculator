const tab3 = (function() {
    let multiCounter = 0;

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
        document.querySelectorAll('#tab-multi .frac-select').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function updateSizeOptions() {
        const typeSel = document.getElementById('m-conduit-type');
        const sizeSel = document.getElementById('m-conduit-size');
        if (!typeSel || !sizeSel) return;

        const conduit = typeSel.value;
        const opts = conduitSpecs[conduit];
        if (!opts) return;

        let html = '';
        for (const sz in opts) {
            html += `<option value="${sz}" data-takeup="${opts[sz].takeup}" data-clr="${opts[sz].clr}">${sz}" (Take-up: ${opts[sz].takeup}", CLR: ${opts[sz].clr}")</option>`;
        }
        sizeSel.innerHTML = html;
    }

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId)?.value) || 0;
        const frac = parseFloat(document.getElementById(fracId)?.value) || 0;
        return whole + frac;
    }

    function addMultiItem() {
        multiCounter++;
        const id = multiCounter;
        const container = document.getElementById('m-bends-container');
        if (!container) return;

        const html = `
            <div class="bend-item" id="m-item-${id}" style="background:#0b0f19; border:1px solid #1f2937; border-radius:10px; padding:14px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; color:#60a5fa; margin-bottom:10px; font-size:0.9rem;">
                    <span>Гиб #${id}</span>
                    <button type="button" onclick="document.getElementById('m-item-${id}').remove()" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:4px 10px; cursor:pointer; font-size:0.8rem;">Удалить</button>
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
                    <label>Позиция / Метка (V1)</label>
                    <div class="inch-split">
                        <input type="number" id="m-v1-whole-${id}" value="12" min="0" />
                        <select id="m-v1-frac-${id}" class="frac-select"></select>
                    </div>
                </div>
                <div class="form-group" id="m-group-v2-${id}">
                    <label>Глубина / Подъем (V2)</label>
                    <div class="inch-split">
                        <input type="number" id="m-v2-whole-${id}" value="4" min="0" />
                        <select id="m-v2-frac-${id}" class="frac-select"></select>
                    </div>
                </div>
                <div class="form-group" id="m-group-v3-${id}" style="display:none;">
                    <label>Ширина препятствия (V3)</label>
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
        const v2Group = document.getElementById(`m-group-v2-${id}`);
        const v3Group = document.getElementById(`m-group-v3-${id}`);

        if (v2Group) v2Group.style.display = (type === 'stub') ? 'none' : 'block';
        if (v3Group) v3Group.style.display = (type === 'saddle4') ? 'block' : 'none';
        if (angleWrap) angleWrap.style.display = (type === 'stub') ? 'none' : 'block';
    }

    function calculateMultiRun() {
        const sizeSel = document.getElementById('m-conduit-size');
        const errContainer = document.getElementById('m-error-container');
        const resDiv = document.getElementById('m-results');
        const instDiv = document.getElementById('m-instructions');

        if (errContainer) errContainer.innerHTML = '';

        if (!sizeSel || sizeSel.options.length === 0) {
            if (errContainer) errContainer.innerHTML = `<div style="color:#ef4444; padding:10px; background:#1e1b4b; border-radius:8px; margin-top:8px;">Ошибка: выберите размер трубы.</div>`;
            return;
        }

        const opt = sizeSel.options[sizeSel.selectedIndex];
        const takeup = parseFloat(opt.getAttribute('data-takeup')) || 6;
        const clr = parseFloat(opt.getAttribute('data-clr')) || 4.375;

        const bendItems = document.querySelectorAll('.bend-item');
        if (bendItems.length === 0) {
            if (errContainer) errContainer.innerHTML = `<div style="color:#ef4444; padding:10px; background:#1e1b4b; border-radius:8px; margin-top:8px;">Добавьте хотя бы один гиб.</div>`;
            return;
        }

        let parsedBends = [];
        let hasError = false;
        let errorMessage = "";

        // Сбор данных и расчет точных границ разметки для каждого гиба
        bendItems.forEach((item, index) => {
            const id = item.id.replace('m-item-', '');
            const type = document.getElementById(`m-type-${id}`).value;
            const v1 = getSplitVal(`m-v1-whole-${id}`, `m-v1-frac-${id}`);
            const v2 = getSplitVal(`m-v2-whole-${id}`, `m-v2-frac-${id}`);
            const v3 = getSplitVal(`m-v3-whole-${id}`, `m-v3-frac-${id}`);
            const angleDeg = parseFloat(document.getElementById(`m-angle-${id}`)?.value) || 30;

            let minMark = v1;
            let maxMark = v1;

            if (type === 'stub') {
                const mark = ConduitMath.calcStub(v1, takeup);
                minMark = Math.min(v1, mark);
                maxMark = Math.max(v1, mark);
                if (mark < 0) {
                    hasError = true;
                    errorMessage = `Гиб #${index + 1} (Stub): метка уходит в минус (${formatInches(mark)}).`;
                }
            } else if (type === 'offset') {
                const res = ConduitMath.calcOffset(v1, v2, angleDeg, takeup, clr);
                minMark = Math.min(res.m1, res.m2);
                maxMark = Math.max(res.m1, res.m2);
                if (res.m1 < 0 || res.m2 < 0) {
                    hasError = true;
                    errorMessage = `Гиб #${index + 1} (Offset): метки уходят в минус (М1: ${formatInches(res.m1)}, М2: ${formatInches(res.m2)}).`;
                }
            } else if (type === 'kick') {
                const shrink = ConduitMath.getShrink(v2, angleDeg);
                const mark = v1 + shrink;
                minMark = Math.min(v1, mark);
                maxMark = Math.max(v1, mark);
            } else if (type === 'saddle3') {
                const res = ConduitMath.calcSaddle3(v1, v2, angleDeg, clr);
                minMark = Math.min(res.m1, res.m3);
                maxMark = Math.max(res.m1, res.m3);
                if (res.m1 < 0 || res.m3 < 0) {
                    hasError = true;
                    errorMessage = `Гиб #${index + 1} (3-Point): метки уходят в минус.`;
                }
            } else if (type === 'saddle4') {
                const res = ConduitMath.calcSaddle4(v1, v2, v3, angleDeg, clr);
                minMark = Math.min(res.m1, res.m4);
                maxMark = Math.max(res.m1, res.m4);
                if (res.m1 < 0 || res.m4 < 0) {
                    hasError = true;
                    errorMessage = `Гиб #${index + 1} (4-Point): метки уходят в минус.`;
                }
            }

            parsedBends.push({ index: index + 1, v1: v1, min: minMark, max: maxMark });
        });

        if (hasError) {
            if (errContainer) errContainer.innerHTML = `<div style="color:#ef4444; padding:10px; background:#1e1b4b; border-radius:8px; margin-top:8px;">⚠️ <b>Ошибка:</b> ${errorMessage}</div>`;
            if (resDiv) resDiv.style.display = 'none';
            if (instDiv) instDiv.style.display = 'none';
            return;
        }

        // Проверка порядка и наложения меток по ходу трубы (сортируем по старту V1)
        let sortedBends = [...parsedBends].sort((a, b) => a.v1 - b.v1);

        for (let i = 0; i < sortedBends.length - 1; i++) {
            let current = sortedBends[i];
            let next = sortedBends[i + 1];

            // Если следующий гиб начинается раньше, чем закончились метки текущего гиба
            if (next.v1 < current.max) {
                hasError = true;
                errorMessage = `Гиб #${next.index} (старт V1 = ${formatInches(next.v1)}) попадает внутрь зоны разметки Гиба #${current.index} (заканчивается на ${formatInches(current.max)})!`;
                break;
            }
        }

        if (hasError) {
            if (errContainer) errContainer.innerHTML = `<div style="color:#ef4444; padding:10px; background:#1e1b4b; border-radius:8px; margin-top:8px;">⚠️ <b>Конфликт разметки:</b> ${errorMessage}</div>`;
            if (resDiv) resDiv.style.display = 'none';
            if (instDiv) instDiv.style.display = 'none';
            return;
        }

        let resHtml = `<div>⚙️ Параметры: Take-up = <b>${takeup}"</b> | CLR = <b>${clr}"</b></div><hr style="border-color:#1f2937; margin:10px 0;">`;
        let stepsSummary = `<h4>Порядок выполнения:</h4><ol>`;

        bendItems.forEach((item, index) => {
            const id = item.id.replace('m-item-', '');
            const type = document.getElementById(`m-type-${id}`).value;
            const v1 = getSplitVal(`m-v1-whole-${id}`, `m-v1-frac-${id}`);
            const v2 = getSplitVal(`m-v2-whole-${id}`, `m-v2-frac-${id}`);
            const v3 = getSplitVal(`m-v3-whole-${id}`, `m-v3-frac-${id}`);
            const angleDeg = parseFloat(document.getElementById(`m-angle-${id}`)?.value) || 30;

            if (type === 'stub') {
                const mark = ConduitMath.calcStub(v1, takeup);
                resHtml += `<div>Гиб #${index + 1} (Stub): Метка на <b>${formatInches(mark)}</b></div>`;
                stepsSummary += `<li>Гиб #${index + 1} (Stub 90°): метка ${formatInches(mark)}.</li>`;
            } else if (type === 'offset') {
                const res = ConduitMath.calcOffset(v1, v2, angleDeg, takeup, clr);
                resHtml += `<div>Гиб #${index + 1} (Offset): М1 = <b>${formatInches(res.m1)}</b>, М2 = <b>${formatInches(res.m2)}</b></div>`;
                stepsSummary += `<li>Гиб #${index + 1} (Offset): М1 = ${formatInches(res.m1)}, М2 = ${formatInches(res.m2)}.</li>`;
            } else if (type === 'kick') {
                const shrink = ConduitMath.getShrink(v2, angleDeg);
                const mark = v1 + shrink;
                resHtml += `<div>Гиб #${index + 1} (Kick): Метка = <b>${formatInches(mark)}</b></div>`;
                stepsSummary += `<li>Гиб #${index + 1} (Kick): метка на ${formatInches(mark)}.</li>`;
            } else if (type === 'saddle3') {
                const res = ConduitMath.calcSaddle3(v1, v2, angleDeg, clr);
                resHtml += `<div>Гиб #${index + 1} (3-Point): М1=${formatInches(res.m1)}, М2=${formatInches(res.m2)}, М3=${formatInches(res.m3)}</div>`;
                stepsSummary += `<li>Гиб #${index + 1} (3-Point Saddle): М1=${formatInches(res.m1)}, М2=${formatInches(res.m2)}, М3=${formatInches(res.m3)}.</li>`;
            } else if (type === 'saddle4') {
                const res = ConduitMath.calcSaddle4(v1, v2, v3, angleDeg, clr);
                resHtml += `<div>Гиб #${index + 1} (4-Point): М1=${formatInches(res.m1)}, М2=${formatInches(res.m2)}, М3=${formatInches(res.m3)}, М4=${formatInches(res.m4)}</div>`;
                stepsSummary += `<li>Гиб #${index + 1} (4-Point Saddle): М1=${formatInches(res.m1)}, М2=${formatInches(res.m2)}, М3=${formatInches(res.m3)}, М4=${formatInches(res.m4)}.</li>`;
            }
        });

        stepsSummary += `</ol>`;

        if (resDiv) { resDiv.style.display = 'block'; resDiv.innerHTML = resHtml; }
        if (instDiv) { instDiv.style.display = 'block'; instDiv.innerHTML = stepsSummary; }
    }

    function init() {
        populateFractions();
        updateSizeOptions();
        
        document.getElementById('m-conduit-type')?.addEventListener('change', updateSizeOptions);
        
        const container = document.getElementById('m-bends-container');
        if (container && container.children.length === 0) {
            addMultiItem();
        }
    }

    return {
        init,
        addMultiItem,
        toggleMultiItemInputs,
        calculateMultiRun
    };
})();
