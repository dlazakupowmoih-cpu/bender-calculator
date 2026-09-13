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

        document.getElementById(`m-group-v2-${id}`).style.display = 'block';
        document.getElementById(`m-group-v3-${id}`).style.display = (type === 'saddle4') ? 'block' : 'none';

        if (type === 'stub') {
            document.getElementById(`m-group-v2-${id}`).style.display = 'none';
            angleWrap.style.display = 'none';
        } else {
            angleWrap.style.display = 'block';
        }
    }

    function calculateMultiRun() {
        const conduitType = document.getElementById('m-conduit-type').value;
        const sizeSel = document.getElementById('m-conduit-size');
        const errContainer = document.getElementById('m-error-container');
        errContainer.innerHTML = '';

        if (sizeSel.options.length === 0) {
            errContainer.innerHTML = `<div style="color:#ef4444; margin-top:8px;">Ошибка: выберите размер трубы.</div>`;
            return;
        }

        const opt = sizeSel.options[sizeSel.selectedIndex];
        const takeup = parseFloat(opt.getAttribute('data-takeup')) || 6;
        const clr = parseFloat(opt.getAttribute('data-clr')) || 4.375;

        const bendItems = document.querySelectorAll('.bend-item');
        if (bendItems.length === 0) {
            errContainer.innerHTML = `<div style="color:#ef4444; margin-top:8px;">Добавьте хотя бы один гиб в цепочку.</div>`;
            return;
        }

        let resHtml = `<div>⚙️ Параметры трубы (${conduitType.toUpperCase()} ${sizeSel.value}" ): Take-up = <b>${takeup}"</b> | CLR = <b>${clr}"</b></div><hr style="border-color:#374151; margin:8px 0;">`;
        let stepsSummary = `<h4>Порядок выполнения:</h4><ol>`;

        bendItems.forEach((item, index) => {
            const id = item.id.replace('m-item-', '');
            const type = document.getElementById(`m-type-${id}`).value;
            const v1 = getSplitVal(`m-v1-whole-${id}`, `m-v1-frac-${id}`);
            const v2 = getSplitVal(`m-v2-whole-${id}`, `m-v2-frac-${id}`);
            
            let description = `Гиб #${index + 1} (${type.toUpperCase()}): `;

            if (type === 'stub') {
                const mark = v1 - takeup;
                description += `Метка на <b>${formatInches(mark)}</b> (согнуть на 90°)`;
                stepsSummary += `<li>Отмерьте ${formatInches(mark)} от торца и сделайте 90° stub-up.</li>`;
            } else {
                const angleSelect = document.getElementById(`m-angle-${id}`);
                const angleDeg = angleSelect ? parseFloat(angleSelect.value) : 30;
                const rad = angleDeg * Math.PI / 180;
                const multiplier = 1 / Math.sin(rad);
                const shrink = v2 * ((1 - Math.cos(rad)) / Math.sin(rad));
                const centerShift = clr * Math.tan(rad / 2);

                if (type === 'offset') {
                    const m1 = v1 + shrink - centerShift;
                    const dist = v2 * multiplier;
                    const m2 = m1 + dist;
                    description += `Оффсет: М1 = <b>${formatInches(m1)}</b>, М2 = <b>${formatInches(m2)}</b> (${angleDeg}°)`;
                    stepsSummary += `<li>Сделайте оффсет под ${angleDeg}° по меткам ${formatInches(m1)} и ${formatInches(m2)}.</li>`;
                } else {
                    description += `Сложный элемент (${type}) позиция ${formatInches(v1)}`;
                    stepsSummary += `<li>Выполните гиб типа ${type} в позиции ${formatInches(v1)}.</li>`;
                }
            }
            resHtml += `<div style="margin-bottom:6px;">${description}</div>`;
        });

        stepsSummary += `</ol>`;

        const resDiv = document.getElementById('m-results');
        resDiv.style.display = 'block';
        resDiv.innerHTML = resHtml;

        const instDiv = document.getElementById('m-instructions');
        instDiv.style.display = 'block';
        instDiv.innerHTML = stepsSummary;
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
