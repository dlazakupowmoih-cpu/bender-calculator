const tab2 = (function() {

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId).value) || 0;
        const frac = parseFloat(document.getElementById(fracId).value) || 0;
        return whole + frac;
    }

    function formatInches(val) {
        return window.formatInches(val);
    }

    function calculateAngle3D() {
        const rise = getSplitVal('a-rise-whole', 'a-rise-frac');
        const run = getSplitVal('a-run-whole', 'a-run-frac');
        const width = getSplitVal('a-width-whole', 'a-width-frac');

        if (rise === 0 && run === 0 && width === 0) {
            document.getElementById('a-results-card').style.display = 'none';
            return;
        }

        const hypotenuse = Math.sqrt(rise*rise + run*run + width*width);

        // углы в разных плоскостях
        const angleXY = run === 0 ? 90 : Math.atan(rise/run)*180/Math.PI;
        const angleXZ = width === 0 ? 90 : Math.atan(rise/width)*180/Math.PI;

        let html = `
            <div><b>Длина гипотенузы (3D расстояние)</b>: ${formatInches(hypotenuse)} (${hypotenuse.toFixed(2)}")</div>
            <div><b>Угол подъёма XY (между высотой и Run)</b>: ${angleXY.toFixed(2)}°</div>
            <div><b>Угол подъёма XZ (между высотой и Width)</b>: ${angleXZ.toFixed(2)}°</div>
        `;

        const resCard = document.getElementById('a-results-card');
        resCard.style.display = 'block';
        resCard.innerHTML = html;
    }

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
        document.querySelectorAll('#a-rise-frac, #a-run-frac, #a-width-frac').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function init() {
        populateFractions();
        calculateAngle3D();
    }

    return {
        init,
        calculateAngle3D
    };
})();
