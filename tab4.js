const tab4 = (function() {
    let pipeCounter = 0;

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
        document.querySelectorAll('#tab-parallel .frac-select').forEach(sel => {
            sel.innerHTML = options;
        });
    }

    function getSplitVal(wholeId, fracId) {
        const whole = parseFloat(document.getElementById(wholeId)?.value) || 0;
        const frac = parseFloat(document.getElementById(fracId)?.value) || 0;
        return whole + frac;
    }

    function toggleParallelSpacing() {
        const mode = document.getElementById('p-spacing-mode')?.value;
        const uniGroup = document.getElementById('p-uniform-gap-group');
        if (uniGroup) uniGroup.style.display = (mode === 'uniform') ? 'block' : 'none';
    }

    function toggleParallelFittingInputs() {
        const type = document.getElementById('p-fitting-type')?.value;
        const v2Group = document.getElementById('p-group-v2');
        const angleGroup = document.getElementById('p-group-angle');
        if (v2Group) v2Group.style.display = (type === 'stub') ? 'none' : 'block';
        if (angleGroup) angleGroup.style.display = (type === 'stub') ? 'none' : 'block';
    }

    function addParallelPipe() {
        pipeCounter++;
        const container = document.getElementById('p-pipes-container');
        if (!container) return;
        const id = pipeCounter;

        const html = `
            <div style="background:#030712; border:1px solid #374151; border-radius:8px; padding:12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; color:#60a5fa; margin-bottom:8px;">
                    <span>Труба #${id}</span>
                    <button type="button" onclick="this.parentElement.parentElement.remove()" style="background:#ef4444; color:#fff; border:none; border-radius:6px; padding:4px 10px; cursor:pointer;">Удалить</button>
                </div>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <div style="flex:1 1 150px;">
                        <label>Тип</label>
                        <select id="p-type-${id}">
                            <option value="emt">EMT</option>
                            <option value="imc">IMC</option>
                            <option value="rigid">Rigid</option>
                        </select>
                    </div>
                    <div style="flex:1 1 150px;">
                        <label>Размер</label>
                        <select id="p-size-${id}">
                            <option value="1/2">1/2"</option>
                            <option value="3/4" selected>3/4"</option>
                            <option value="1">1"</option>
                            <option value="1-1/4">1-1/4"</option>
                            <option value="1-1/2">1-1/2"</option>
                            <option value="2">2"</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    }

    function calculateParallelRun() {
        const fittingType = document.getElementById('p-fitting-type')?.value || 'stub';
        const uniformGap = getSplitVal('p-gap-whole', 'p-gap-frac');
        const baseV1 = getSplitVal('p-v1-whole', 'p-v1-frac');
        const baseV2 = getSplitVal('p-v2-whole', 'p-v2-frac');
        const angle = fittingType === 'stub' ? 90 : parseFloat(document.getElementById('p-base-angle')?.value || 30);

        const pipes = [];
        document.querySelectorAll('#p-pipes-container > div').forEach((pipeDiv, idx) => {
            const pipeNum = idx + 1;
            const typeSel = document.getElementById(`p-type-${pipeNum}`);
            const sizeSel = document.getElementById(`p-size-${pipeNum}`);
            const conduitType = typeSel ? typeSel.value : 'emt';
            const sizeVal = sizeSel ? sizeSel.value : '3/4';
            
            const spec = conduitSpecs[conduitType]?.[sizeVal] || { takeup: 6, clr: 4.375 };

            pipes.push({ 
                id: pipeNum, 
                takeup: spec.takeup, 
                clr: spec.clr,
                type: conduitType.toUpperCase(),
                size: sizeVal
            });
        });

        let resultsHTML = `<h3>📐 Спецификация пакета параллельных труб:</h3>`;
        let cumShift = 0;

        pipes.forEach((p, idx) => {
            if (idx > 0) cumShift += uniformGap;
            let desc = "";

            if (fittingType === 'stub') {
                let mark = baseV1 + cumShift - p.takeup;
                desc = `90° Stub-up | Метка от торца: <b>${formatInches(mark)}</b> (Take-up: ${p.takeup}")`;
            } else {
                const res = ConduitMath.calcOffset(baseV1 + cumShift, baseV2, angle, p.takeup, p.clr);
                desc = `Offset ${angle}° | М1 = <b>${formatInches(res.m1)}</b>, М2 = <b>${formatInches(res.m2)}</b> (Shrink: ${formatInches(res.shrink)})`;
            }

            resultsHTML += `<div style="margin-bottom:8px; padding:6px; background:#030712; border-radius:6px;"><b>Труба #${p.id} (${p.type} ${p.size}"):</b> ${desc}</div>`;
        });

        const resDiv = document.getElementById('p-results');
        if (resDiv) {
            resDiv.style.display = 'block';
            resDiv.innerHTML = resultsHTML;
        }
    }

    function init() {
        populateFractions();
        toggleParallelSpacing();
        toggleParallelFittingInputs();
        
        const container = document.getElementById('p-pipes-container');
        if (container && container.children.length === 0) {
            addParallelPipe();
            addParallelPipe();
        }

        document.getElementById('p-spacing-mode')?.addEventListener('change', toggleParallelSpacing);
        document.getElementById('p-fitting-type')?.addEventListener('change', toggleParallelFittingInputs);
    }

    return {
        init,
        addParallelPipe,
        calculateParallelRun
    };
})();