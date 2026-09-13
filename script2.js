// --------- Вкладка 3: Multi-Run (Цепочка изгибов) с выбором вида гиба ---------
const multiBendsContainer = document.getElementById('multi-bends-container');
const multiErrorContainer = document.getElementById('multi-error-container');
const multiResultsDiv = document.getElementById('multi-results');
let multiBendCount = 0;

function createMultiBendRow(id) {
  const div = document.createElement('div');
  div.classList.add('multi-bend-row');
  div.style.marginBottom = '12px';

  div.innerHTML = `
    <label>Изгиб #${id + 1} — Вид изгиба</label>
    <select class="multi-bend-type" data-id="${id}">
      <option value="stub">90° Stub-up</option>
      <option value="offset" selected>Offset</option>
      <option value="saddle3">3-Point Saddle</option>
      <option value="saddle4">4-Point Saddle</option>
    </select>

    <label>Угол (градусы)</label>
    <select class="multi-bend-angle" data-id="${id}">
      <option value="10">10°</option>
      <option value="22.5" selected>22.5°</option>
      <option value="30">30°</option>
      <option value="45">45°</option>
      <option value="90">90° (только для Stub-up)</option>
      <option value="custom">Кастомный...</option>
    </select>

    <div class="custom-angle-wrapper" style="display:none; margin-top:6px;">
      <input type="range" min="1" max="89" step="0.5" value="30" class="multi-bend-custom-slider" data-id="${id}" />
      <input type="number" min="1" max="89" step="0.5" value="30" class="multi-bend-custom-number" data-id="${id}" />
    </div>

    <label>Расстояние до изгиба (дюймы)</label>
    <div class="inch-split">
      <input type="number" class="multi-bend-dist-whole" min="0" value="6" data-id="${id}" />
      <select class="multi-bend-dist-frac" data-id="${id}"></select>
    </div>

    <label style="display:none;" class="multi-bend-val3-label" data-id="${id}">Ширина (для Saddle4)</label>
    <div class="inch-split" style="display:none;" >
      <input type="number" class="multi-bend-val3-whole" min="0" value="6" data-id="${id}" />
      <select class="multi-bend-val3-frac" data-id="${id}"></select>
    </div>

    <button class="multi-remove-bend-btn" data-id="${id}" style="margin-top:6px;">Удалить изгиб</button>
  `;

  return div;
}

function addMultiBend() {
  const newId = multiBendCount++;
  const row = createMultiBendRow(newId);
  multiBendsContainer.appendChild(row);

  // Заполнить дробные селекты val3 и dist
  populateMultiFractionSelect(row.querySelector(`select.multi-bend-dist-frac[data-id="${newId}"]`));
  populateMultiFractionSelect(row.querySelector(`select.multi-bend-val3-frac[data-id="${newId}"]`));

  attachMultiBendListeners(row, newId);
}

// Заполнение дробных селектов для Multi-Run
function populateMultiFractionSelect(sel){
  sel.innerHTML='';
  fractionOptions.forEach(fr=>{
    let opt=document.createElement('option');
    opt.value=fr.value;
    opt.textContent=fr.label;
    sel.appendChild(opt);
  });
}

function getSplitValFromElem(wholeElem, fracElem) {
  const whole = parseFloat(wholeElem.value) || 0;
  const frac = parseFloat(fracElem.value) || 0;
  return whole + frac;
}

function attachMultiBendListeners(row, id) {
  const bendTypeSelect = row.querySelector(`select.multi-bend-type[data-id="${id}"]`);
  const angleSelect = row.querySelector(`select.multi-bend-angle[data-id="${id}"]`);
  const slider = row.querySelector(`input.multi-bend-custom-slider[data-id="${id}"]`);
  const numberInput = row.querySelector(`input.multi-bend-custom-number[data-id="${id}"]`);
  const fracDist = row.querySelector(`select.multi-bend-dist-frac[data-id="${id}"]`);
  const val3Label = row.querySelector(`.multi-bend-val3-label[data-id="${id}"]`);
  const val3Whole = row.querySelector(`input.multi-bend-val3-whole[data-id="${id}"]`);
  const val3Frac = row.querySelector(`select.multi-bend-val3-frac[data-id="${id}"]`);
  const val3Container = val3Whole.parentElement;

  // Показ/скрытие кастомного угла
  angleSelect.addEventListener('change', () => {
    let val = angleSelect.value;
    if (val === 'custom') {
      slider.parentElement.style.display = 'flex';
    } else {
      slider.parentElement.style.display = 'none';
    }
  });

  slider.oninput = () => { numberInput.value = slider.value; };
  numberInput.oninput = () => {
    let val = parseFloat(numberInput.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 89) val = 89;
    slider.value = val;
    numberInput.value = val;
  };

  // Показ/скрытие полей ширины для Saddle4 и логика углов для Stub-up
  bendTypeSelect.addEventListener('change', () => {
    if (bendTypeSelect.value === 'saddle4') {
      val3Label.style.display = 'block';
      val3Container.style.display = 'flex';
    } else {
      val3Label.style.display = 'none';
      val3Container.style.display = 'none';
    }

    // Управление доступностью угла 90° для Stub-up и прочих
    for (let option of angleSelect.options) {
      if (bendTypeSelect.value === 'stub') {
        option.disabled = !(option.value === '90' || option.value === 'custom');
      } else {
        option.disabled = (option.value === '90');
      }
    }

    if (bendTypeSelect.value === 'stub' && angleSelect.value !== '90' && angleSelect.value !== 'custom') {
      angleSelect.value = '90';
      angleSelect.dispatchEvent(new Event('change'));
    } else if (bendTypeSelect.value !== 'stub' && angleSelect.value === '90') {
      angleSelect.value = '30';
      angleSelect.dispatchEvent(new Event('change'));
    }
  });

  // Заполнить дробные селекты val3 и dist
  populateMultiFractionSelect(fracDist);
  populateMultiFractionSelect(val3Frac);

  // Удаление изгиба
  row.querySelector('.multi-remove-bend-btn').addEventListener('click', () => {
    row.remove();
  });

  // Инициализация смены угла
  angleSelect.dispatchEvent(new Event('change'));
}

document.getElementById('multi-add-bend-btn').addEventListener('click', addMultiBend);

function calculateMultiRun() {
  const ctype = document.getElementById('multi-conduit-type').value;
  const csize = document.getElementById('multi-conduit-size').value;
  const specs = conduitSpecs[ctype][csize];
  if (!specs) {
    alert("Выберите тип и размер трубы.");
    return;
  }
  const takeup = specs.takeup;
  const clr = specs.clr;

  const bends = [];
  const bendRows = multiBendsContainer.querySelectorAll('.multi-bend-row');
  if (bendRows.length === 0) {
    multiErrorContainer.innerHTML = '<div class="error-banner">Добавьте хотя бы один изгиб.</div>';
    multiResultsDiv.style.display = 'none';
    return;
  } else {
    multiErrorContainer.innerHTML = '';
  }

  for (let row of bendRows) {
    const id = row.querySelector('select.multi-bend-angle').getAttribute('data-id');
    const bendType = row.querySelector(`select.multi-bend-type[data-id="${id}"]`).value;
    let angleSel = row.querySelector(`select.multi-bend-angle[data-id="${id}"]`);
    let angleDeg = angleSel.value === 'custom' ? parseFloat(row.querySelector(`input.multi-bend-custom-number[data-id="${id}"]`).value) : parseFloat(angleSel.value);
    if (isNaN(angleDeg) || angleDeg <= 0) angleDeg = 30;

    let distWhole = parseFloat(row.querySelector(`input.multi-bend-dist-whole[data-id="${id}"]`).value);
    let distFrac = parseFloat(row.querySelector(`select.multi-bend-dist-frac[data-id="${id}"]`).value);
    if (isNaN(distWhole)) distWhole = 0;
    if (isNaN(distFrac)) distFrac = 0;

    const val3WholeElem = row.querySelector(`input.multi-bend-val3-whole[data-id="${id}"]`);
    const val3FracElem = row.querySelector(`select.multi-bend-val3-frac[data-id="${id}"]`);
    const val3 = val3WholeElem && val3FracElem ? getSplitValFromElem(val3WholeElem, val3FracElem) : 0;

    bends.push({ bendType, angleDeg, distance: distWhole + distFrac, val3 });
  }

  let currentPos = 0;
  let instruction = `Тип трубы/размер: ${ctype.toUpperCase()} ${csize}" (Take-up: ${takeup}", CLR: ${clr}")\n`;
  instruction += `Multi-Run, количество изгибов: ${bends.length}\n\n`;

  bends.forEach((bend, idx) => {
    const rad = bend.angleDeg * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tanHalf = Math.tan(rad/2);
    const shrinkSingle = bend.distance * ((1 - cos) / sin);
    const adj = (bend.distance / sin) * cos;
    const shrinkOffset = (bend.distance / sin) - adj;
    let points = [];

    if (bend.bendType === 'stub') {
      if (bend.angleDeg !== 90) {
        bend.angleDeg = 90; // строго 90 для Stub-up
      }
      const markPos = currentPos + bend.distance - takeup;
      instruction += `Изгиб #${idx+1} (Stub-up 90°):\n`;
      instruction += `1) Отмерьте ${formatInches(markPos)} от торца трубы и сделайте метку.\n`;
      instruction += `2) Вставьте трубу так, чтобы метка попала на стрелку трубогиба.\n`;
      instruction += `3) Аккуратно согните трубу ровно на 90°.\n\n`;
      currentPos += bend.distance;
    } else if (bend.bendType === 'offset') {
      const hyp = bend.distance / sin;
      const centerShift = clr * tanHalf;
     

    
