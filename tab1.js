const tab1 = (function() {
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
        document.querySelectorAll('#tab-single .frac-select').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function updateSizeOptions() {
        const typeSel = document.getElementById('s-conduit-type');
        const sizeSel = document.getElementById('s-conduit-size');
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

    function calculateSingle() {
        const sizeSelect = document.getElementById('s-conduit-size');
        if (!sizeSelect || sizeSelect.options.length === 0) return;
        
        const selectedOpt = sizeSelect.options[sizeSelect.selectedIndex];
        const takeup = parseFloat(selectedOpt.getAttribute('data-takeup')) || 6;
        const clr = parseFloat(selectedOpt.getAttribute('data-clr')) || 4.375;

        const bendType = document.getElementById('s-bend-type')?.value || 'stub';
        const angleDeg = parseFloat(document.getElementById('s-bend-angle')?.value) || 30;
        
        const v1 = getSplitVal('s-v1-whole', 's-v1-frac');
        const v2 = getSplitVal('s-v2-whole', 's-v2-frac');
        const v3 = getSplitVal('s-v3-whole', 's-v3-frac');

        let html = '';
        let instructions = '';

        if (bendType === 'stub') {
            const mark = ConduitMath.calcStub(v1, takeup);
            html = `<b>90° Stub-up:</b> Метка для сгиба на <b>${formatInches(mark)}</b> от торца трубы.`;
            instructions = `<ol><li>Отмерьте от конца трубы <b>${formatInches(mark)}</b>.</li><li>Согните на 90°.</li></ol>`;
        } else if (bendType === 'offset' || bendType === 'offset_box') {
            const res = ConduitMath.calcOffset(v1, v2, angleDeg, takeup, clr);
            html = `<b>Offset (${angleDeg}°):</b> М1 = <b>${formatInches(res.m1)}</b> | М2 = <b>${formatInches(res.m2)}</b>`;
            instructions = `<ol><li>Метка М1: <b>${formatInches(res.m1)}</b></li><li>Метка М2: <b>${formatInches(res.m2)}</b></li><li>Согните на ${angleDeg}° в одном направлении.</li></ol>`;
        } else if (bendType === 'saddle3') {
            const res = ConduitMath.calcSaddle3(v1, v2, angleDeg, clr);
            html = `<b>3-Point Saddle (${angleDeg}°):</b><br>М1 = <b>${formatInches(res.m1)}</b><br>М2 (Центр) = <b>${formatInches(res.m2)}</b><br>М3 = <b>${formatInches(res.m3)}</b>`;
            instructions = `<ol><li>Центр (М2): <b>${formatInches(res.m2)}</b></li><li>М1 и М3 на расстоянии ${formatInches(res.dist)} от центра.</li></ol>`;
        } else if (bendType === 'saddle4') {
            const res = ConduitMath.calcSaddle4(v1, v2, v3, angleDeg, clr);
            html = `<b>4-Point Saddle:</b><br>М1 = <b>${formatInches(res.m1)}</b> | М2 = <b>${formatInches(res.m2)}</b> | М3 = <b>${formatInches(res.m3)}</b> | М4 = <b>${formatInches(res.m4)}</b>`;
            instructions = `<ol><li>М1: ${formatInches(res.m1)}</li><li>М2: ${formatInches(res.m2)}</li><li>М3: ${formatInches(res.m3)}</li><li>М4: ${formatInches(res.m4)}</li></ol>`;
        }

        const resDiv = document.getElementById('s-results');
        const instDiv = document.getElementById('s-instructions');
        if (resDiv) { resDiv.style.display = 'block'; resDiv.innerHTML = html; }
        if (instDiv) { instDiv.style.display = 'block'; instDiv.innerHTML = instructions; }
    }

    function init() {
        populateFractions();
        updateSizeOptions();
        
        document.getElementById('s-conduit-type')?.addEventListener('change', updateSizeOptions);
        document.getElementById('btn-calc-single')?.addEventListener('click', calculateSingle);
    }

    return { init, calculateSingle };
})();