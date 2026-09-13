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
        // ... Полный код вычислений из предыдущих сообщений
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
