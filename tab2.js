const tab2 = (function() {
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
        document.querySelectorAll('#tab-kick .frac-select').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId)?.value) || 0;
        const frac = parseFloat(document.getElementById(fracId)?.value) || 0;
        return whole + frac;
    }

    function calculateKick() {
        const distance = getSplitVal('k-dist-whole', 'k-dist-frac');
        const height = getSplitVal('k-height-whole', 'k-height-frac');
        const angleDeg = parseFloat(document.getElementById('k-angle')?.value) || 30;

        const shrink = ConduitMath.getShrink(height, angleDeg);
        const mark = distance + shrink;

        const html = `
            <b>Kick (${angleDeg}°):</b><br>
            Расстояние дометки: <b>${formatInches(mark)}</b><br>
            Учет Shrink (укорочения): <b>${formatInches(shrink)}</b>
        `;
        const instructions = `
            <ol>
                <li>Отмерьте от края трубы <b>${formatInches(mark)}</b>.</li>
                <li>Согните на <b>${angleDeg}°</b>, учитывая направление подъема.</li>
            </ol>
        `;

        const resDiv = document.getElementById('k-results');
        const instDiv = document.getElementById('k-instructions');
        if (resDiv) { resDiv.style.display = 'block'; resDiv.innerHTML = html; }
        if (instDiv) { instDiv.style.display = 'block'; instDiv.innerHTML = instructions; }
    }

    function init() {
        populateFractions();
        document.getElementById('btn-calc-kick')?.addEventListener('click', calculateKick);
    }

    return { init, calculateKick };
})();