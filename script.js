document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');

    // Убираем активность со всех кнопок и вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Добавляем активность на нажатую кнопку и нужную вкладку
    button.classList.add('active');
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.classList.add('active');
  });
});

// ------------------------------------
// Константы и утилиты
// ------------------------------------
const conduitSpecs = {
  emt: { '1/2': { takeup: 5, clr: 4.0 }, '3/4': { takeup: 6, clr: 4.375 }, '1': { takeup: 8, clr: 5.75 }, '1-1/4': { takeup: 11, clr: 7.25 }, '1-1/2': { takeup: 13, clr: 8.5 }, '2': { takeup: 16, clr: 10.5 } },
  imc: { '1/2': { takeup: 6, clr: 4.5 }, '3/4': { takeup: 8, clr: 5.5 }, '1': { takeup: 11, clr: 7.0 }, '1-1/4': { takeup: 14, clr: 8.25 }, '1-1/2': { takeup: 16, clr: 9.5 }, '2': { takeup: 20, clr: 12.0 } },
  rigid: { '1/2': { takeup: 7, clr: 4.25 }, '3/4': { takeup: 10, clr: 5.25 }, '1': { takeup: 12, clr: 6.5 }, '1-1/4': { takeup: 15, clr: 8.0 }, '1-1/2': { takeup: 18, clr: 9.25 }, '2': { takeup: 22, clr: 11.5 } }
};

const fractionOptions = [
  { value: 0, label: "0" }, { value: 1 / 16, label: "1/16" }, { value: 1 / 8, label: "1/8" },
  { value: 3 / 16, label: "3/16" }, { value: 1 / 4, label: "1/4" }, { value: 5 / 16, label: "5/16" },
  { value: 3 / 8, label: "3/8" }, { value: 7 / 16, label: "7/16" }, { value: 1 / 2, label: "1/2" },
  { value: 9 / 16, label: "9/16" }, { value: 5 / 8, label: "5/8" }, { value: 11 / 16, label: "11/16" },
  { value: 3 / 4, label: "3/4" }, { value: 13 / 16, label: "13/16" }, { value: 7 / 8, label: "7/8" },
  { value: 15 / 16, label: "15/16" }
];

function populateFractionSelect(id) {
  const sel = document.getElementById(id);
  if (!sel) return;
  sel.innerHTML = "";
  fractionOptions.forEach(fr => {
    const opt = document.createElement('option');
    opt.value = fr.value;
    opt.textContent = fr.label;
    sel.appendChild(opt);
  });
}

function getSplitVal(wholeId, fracId) {
  const whole = parseFloat(document.getElementById(wholeId).value) || 0;
  const frac = parseFloat(document.getElementById(fracId).value) || 0;
  return whole + frac;
}

function formatInches(inches) {
  if (inches < 0) inches = 0;
  const total16 = Math.round(inches * 16);
  const whole = Math.floor(total16 / 16);
  let rem = total16 % 16;
  if (rem === 0) return whole > 0 ? `${whole}"` : "0\"";
  let num = rem, den = 16;
  while (num % 2 === 0 && den % 2 === 0) {
    num /= 2; den /= 2;
  }
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

// ------------------------------
// Управление вкладками
// ------------------------------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const tabId = e.currentTarget.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});

// ------------------------------
// Заполнение размеров труб
// ------------------------------
function populateSizes(prefix) {
  const type = document.getElementById(prefix + '-conduit-type').value;
  const sizeSelect = document.getElementById(prefix + '-conduit-size');
  sizeSelect.innerHTML = '';
  for (let sz in conduitSpecs[type]) {
    let opt = document.createElement('option');
    opt.value = sz;
    opt.textContent = `${sz}" (Take-up: ${conduitSpecs[type][sz].takeup}", CLR: ${conduitSpecs[type][sz].clr}")`;
    sizeSelect.appendChild(opt);
  }
}
populateSizes('single');
populateSizes('multi');
document.getElementById('single-conduit-type').addEventListener('change', () => populateSizes('single'));
document.getElementById('multi-conduit-type').addEventListener('change', () => populateSizes('multi'));

// ------------------------------
// Одиночный гиб: кастомный угол, ограничение выбора угла
// ------------------------------
const angleSelect = document.getElementById('single-bend-angle');
const slider = document.getElementById('single-custom-angle-slider');
const numberInput = document.getElementById('single-custom-angle-number');
angleSelect.addEventListener('change', () => {
  const wrapper = document.getElementById('single-custom-angle-wrapper');
  wrapper.style.display = (angleSelect.value === 'custom') ? 'flex' : 'none';
});
slider.oninput = () => { numberInput.value = slider.value; };
numberInput.oninput = () => {
  let val = parseFloat(numberInput.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 89) val = 89;
  slider.value = val;
  numberInput.value = val;
};
function enforceAngleRestriction() {
  const bendType = document.getElementById('single-bend-type').value;
  const angleSel = document.getElementById('single-bend-angle');
  const currentVal = angleSel.value;

  for (let i = 0; i < angleSel.options.length; i++) {
    const val = angleSel.options[i].value;
    if (bendType === 'stub') {
      angleSel.options[i].disabled = !(val === '90' || val === 'custom');
    } else {
      angleSel.options[i].disabled = (val === '90');
    }
  }

  if (bendType === 'stub') {
    if (currentVal !== '90' && currentVal !== 'custom') {
      angleSel.value = '90';
      angleSel.dispatchEvent(new Event('change'));
    } else if (currentVal === 'custom') {
      let customAngle = parseFloat(numberInput.value);
      if (customAngle !== 90) {
        alert('Для 90° Stub-up кастомный угол должен быть ровно 90°.');
        numberInput.value = 90;
        slider.value = 90;
      }
    }
  } else {
    if (currentVal === '90') {
      angleSel.value = '30';
      angleSel.dispatchEvent(new Event('change'));
    }
  }
}
document.getElementById('single-bend-type').addEventListener('change', () => {
  enforceAngleRestriction();
  updateSingleInputs();
});
document.getElementById('single-bend-angle').addEventListener('change', enforceAngleRestriction);
enforceAngleRestriction();

function updateSingleInputs() {
  const type = document.getElementById('single-bend-type').value;
  const show = (type === 'saddle4');
  const val3container = document.getElementById('single-val3-container');
  const val3label = document.getElementById('single-label-val3');
  if (show) {
    val3container.style.display = 'flex';
    val3label.style.display = 'block';
  } else {
    val3container.style.display = 'none';
    val3label.style.display = 'none';
  }
}
updateSingleInputs();

// ------------------------------
// Функция рассчета одиночного гиба и инструкции
// ------------------------------
function calculateSingleBend() {
  const ctype = document.getElementById('single-conduit-type').value;
  const csize = document.getElementById('single-conduit-size').value;
  const specs = conduitSpecs[ctype][csize];
  if (!specs) {
    alert("Выберите тип и размер трубы.");
    return;
  }
  const type = document.getElementById('single-bend-type').value;
  const angleSelect = document.getElementById('single-bend-angle');
  let angleDeg = angleSelect.value === 'custom' ? parseFloat(document.getElementById('single-custom-angle-number').value) : parseFloat(angleSelect.value);

  if (type === 'stub' && angleDeg !== 90) {
    alert("Для 90° Stub-up угол должен быть ровно 90°.");
    return;
  }
  if (type !== 'stub' && angleDeg === 90) {
    alert("Угол 90° доступен только для 90° Stub-up.");
    return;
  }
  if (isNaN(angleDeg) || angleDeg <= 0) angleDeg = 30;

  const val1 = getSplitVal('single-val1-whole', 'single-val1-frac');
  const val2 = getSplitVal('single-val2-whole', 'single-val2-frac');
  const val3 = getSplitVal('single-val3-whole', 'single-val3-frac');

  const rad = angleDeg * Math.PI / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const tanHalf = Math.tan(rad / 2);
  const takeup = specs.takeup;
  const clr = specs.clr;

  let res = `Тип трубы/размер: ${ctype.toUpperCase()} ${csize}" (Take-up: ${takeup}", CLR: ${clr}")\nВид изгиба: ${document.getElementById('single-bend-type').selectedOptions[0].text}\nУгол изгиба: ${angleDeg}°\n\n`;

  if (type === 'stub') {
    const markPos = val1 - takeup;
    res += `1) Отмерьте от торца трубы ${formatInches(markPos)} и сделайте метку.\n`;
    res += `2) Вставьте трубу в трубогиб, совместите метку со стрелкой.\n`;
    res += `3) Аккуратно согните трубу на 90°.\n`;
  } else if (type === 'offset') {
    const hyp = val2 / sin;
    const adj = hyp * cos;
    const shrink = hyp - adj;
    const centerShift = clr * tanHalf;
    const M1 = val1 + shrink - centerShift;
    const M2 = M1 + hyp;
    res += `1) Отметьте метку M1: ${formatInches(M1)}.\n`;
    res += `2) Поместите трубу, совместите метку M1 со стрелкой.\n`;
    res += `3) Согните трубу на угол ${angleDeg}°.\n`;
    res += `4) Поверните трубу на 180°.\n`;
    res += `5) Отметьте метку M2: ${formatInches(M2)}.\n`;
    res += `6) Совместите метку M2 со стрелкой и согните ещё раз на ${angleDeg}°.\n`;
  } else if (type === 'saddle3') {
    const mult = 1 / sin;
    const shrinkSingle = val2 * ((1 - cos) / sin);
    const totalShrink = 2 * shrinkSingle;
    const centerShift = clr * tanHalf;
    const dist = val2 * mult;
    const M2 = val1 + totalShrink;
    const M1 = M2 - dist - centerShift;
    const M3 = M2 + dist + centerShift;
    res += `1) Отметьте метки:\n  M1 = ${formatInches(M1)}, M2 = ${formatInches(M2)}, M3 = ${formatInches(M3)}.\n`;
    res += `2) Сгибайте трубу на M2 на двойной угол ${(angleDeg * 2).toFixed(1)}°.\n`;
    res += `3) Поверните трубу, согните метки M1 и M3 на угол ${angleDeg}°.\n`;
  } else if (type === 'saddle4') {
    const mult = 1 / sin;
    const shrinkSingle = val2 * ((1 - cos) / sin);
    const totalShrink = 2 * shrinkSingle;
    const centerShift = clr * tanHalf;
    const dist = val2 * mult;
    const adjCenter = val1 + totalShrink;
    const halfWidth = val3 / 2;
    const M2 = adjCenter - halfWidth;
    const M3 = adjCenter + halfWidth;
    const M1 = M2 - dist - centerShift;
    const M4 = M3 + dist + centerShift;
    res += `1) Отметьте метки:\n  M1 = ${formatInches(M1)}, M2 = ${formatInches(M2)}, M3 = ${formatInches(M3)}, M4 = ${formatInches(M4)}.\n`;
    res += `2) Выполните гибы последовательно, контролируя равномерность.\n`;
  }

  const resDiv = document.getElementById('single-results');
  resDiv.style.display = 'block';
  resDiv.innerHTML = res.replace(/\n/g, '<br>');
}
document.getElementById('single-calc-btn').addEventListener('click', calculateSingleBend);

// Здесь так же добавим дальше логику Multi-Run, Parallel и Angle во втором сообщении – так как сюда уже много идет.

// Далее скину вторую часть – полный код для Multi-Run, Parallel и расчёта угла.
// ------------------------------
// Вкладка 2: Расчёт угла по трём измерениям
// ------------------------------
function calculate3DAngle() {
  const rise = getSplitVal('angle-rise-whole', 'angle-rise-frac');
  const width = getSplitVal('angle-width-whole', 'angle-width-frac');
  const length = getSplitVal('angle-length-whole', 'angle-length-frac');
  const resDiv = document.getElementById('angle-results');

  if (rise <= 0 && width <= 0 && length <= 0) {
    resDiv.style.display = 'none';
    return;
  }

  const horizontal = Math.sqrt(width * width + length * length);
  const radians = horizontal === 0 ? Math.PI / 2 : Math.atan(rise / horizontal);
  const exactAngle = radians * 180 / Math.PI;
  const travel = Math.sqrt(rise * rise + width * width + length * length);
  const standards = [10, 22.5, 30, 45, 60, 90];
  const closest = standards.reduce((a, b) => Math.abs(b - exactAngle) < Math.abs(a - exactAngle) ? b : a);

  resDiv.style.display = 'block';
  resDiv.innerHTML =
    `Точный угол подъема: <b>${exactAngle.toFixed(2)}°</b><br>` +
    `Ближайший стандартный угол: <b>~${closest}°</b><br>` +
    `Общая длина (3D путь): <b>${formatInches(travel)}</b> (${travel.toFixed(2)}")<br><br>` +
    `<b>Инструкция:</b><br>Измерьте высоту, ширину и длину. Используйте угол для точной разметки трубы.`;
}
document.getElementById('angle-calc-btn').addEventListener('click', calculate3DAngle);

// ------------------------------
// Вкладка 3: Multi-Run (цепочка изгибов)
// ------------------------------

let multiBendCount = 0;
const multiBendsContainer = document.getElementById('multi-bends-container');
const multiErrorContainer = document.getElementById('multi-error-container');
const multiResultsDiv = document.getElementById('multi-results');

function createMultiBendRow(id) {
  const div = document.createElement('div');
  div.classList.add('multi-bend-row');
  div.style.marginBottom = '12px';

  div.innerHTML = `
  <label>Изгиб #${id + 1} — Вид изгиба</label>
  <select class="multi-bend-type" data-id="${id}">
    <option value="single">Kick (Single Bend)</option>
    <option value="offset" selected>Offset</option>
    <option value="stub">90° Stub-up</option>
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

function populateMultiFractionSelect(sel) {
  sel.innerHTML = '';
  fractionOptions.forEach(fr => {
    let opt = document.createElement('option');
    opt.value = fr.value;
    opt.textContent = fr.label;
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

  angleSelect.addEventListener('change', () => {
    if (angleSelect.value === 'custom') {
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

  bendTypeSelect.addEventListener('change', () => {
    if (bendTypeSelect.value === 'saddle4') {
      val3Label.style.display = 'block';
      val3Container.style.display = 'flex';
    } else {
      val3Label.style.display = 'none';
      val3Container.style.display = 'none';
    }

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

  populateMultiFractionSelect(fracDist);
  populateMultiFractionSelect(val3Frac);

  row.querySelector('.multi-remove-bend-btn').addEventListener('click', () => {
    row.remove();
  });
  bendTypeSelect.dispatchEvent(new Event('change'));
  angleSelect.dispatchEvent(new Event('change'));
}

function addMultiBend() {
  const newId = multiBendCount++;
  const row = createMultiBendRow(newId);
  multiBendsContainer.appendChild(row);
  populateMultiFractionSelect(row.querySelector(`select.multi-bend-dist-frac[data-id="${newId}"]`));
  populateMultiFractionSelect(row.querySelector(`select.multi-bend-val3-frac[data-id="${newId}"]`));
  attachMultiBendListeners(row, newId);
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

  const bends = [];
  const bendRows = multiBendsContainer.querySelectorAll('.multi-bend-row');
  if (!bendRows.length) {
    multiErrorContainer.innerHTML = '<div class="error-banner">Добавьте хотя бы один изгиб.</div>';
    multiResultsDiv.style.display = 'none';
    return;
  }
  multiErrorContainer.innerHTML = '';

  for (let row of bendRows) {
    const id = row.querySelector('select.multi-bend-type').getAttribute('data-id');
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

  let takeup = specs.takeup;
  let clr = specs.clr;
  let currentPos = 0;
  let instruction = `Тип трубы/размер: ${ctype.toUpperCase()} ${csize}" (Take-up: ${takeup}", CLR: ${clr}")\n`;
  instruction += `Multi-Run, количество изгибов: ${bends.length}\n\n`;

  bends.forEach((b, idx) => {
    const rad = b.angleDeg * Math.PI / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const tanHalf = Math.tan(rad/2);

    instruction += `Изгиб #${idx + 1} (${b.bendType}):\n`;

    if (b.bendType === 'single') {
      let mark = currentPos + b.distance - takeup;
      instruction += `1) Отмерьте от торца трубы ${formatInches(mark)} и сделайте метку.\n`;
      instruction += `2) Совместите метку со стрелкой на трубогибе.\n`;
      instruction += `3) Согните трубу на угол ${b.angleDeg}°.\n\n`;
      currentPos += b.distance;
    } else if (b.bendType === 'stub') {
      if (b.angleDeg !== 90) b.angleDeg = 90; // Жесткий 90
      let mark = currentPos + b.distance - takeup;
      instruction += `1) Отмерьте от торца трубы ${formatInches(mark)} и сделайте метку.\n`;
      instruction += `2) Совместите метку со стрелкой.\n`;
      instruction += `3) Согните трубу ровно на 90°.\n\n`;
      currentPos += b.distance;
    } else if (b.bendType === 'offset') {
      const hyp = b.distance / sin;
      const adj = hyp * cos;
      const shrink = hyp - adj;
      const centerShift = clr * tanHalf;
      const M1 = currentPos + shrink - centerShift;
      const M2 = M1 + hyp;
      instruction += `- Угол: ${b.angleDeg}°\n`;
      instruction += `- Метка M1: ${formatInches(M1)} — отмерьте и сделайте метку.\n`;
      instruction += `- Совместите метку M1 со стрелкой трубогиба.\n`;
      instruction += `- Согните на угол ${b.angleDeg}°.\n`;
      instruction += `- Поверните трубу на 180°.\n`;
      instruction += `- Отметьте метку M2: ${formatInches(M2)}.\n`;
      instruction += `- Совместите метку M2 со стрелкой и согните снова на ${b.angleDeg}°.\n\n`;
      currentPos = M2;
    } else if (b.bendType === 'saddle3') {
      const shrinkSingle = b.distance * ((1 - cos) / sin);
      const totalShrink = 2 * shrinkSingle;
      const centerShift = clr * tanHalf;
      const dist = b.distance / sin;
      const M2 = currentPos + totalShrink;
      const M1 = M2 - dist - centerShift;
      const M3 = M2 + dist + centerShift;
      instruction += `- Угол: ${b.angleDeg}°\n`;
      instruction += `- Метки:\n  M1 = ${formatInches(M1)}, M2 (центр) = ${formatInches(M2)}, M3 = ${formatInches(M3)}.\n`;
      instruction += `- Сгибайте по меткам: M2 на двойной угол ${(b.angleDeg * 2).toFixed(1)}°, затем M1 и M3 на угол ${b.angleDeg}°.\n\n`;
      currentPos = M2;
    } else if (b.bendType === 'saddle4') {
      const shrinkSingle = b.distance * ((1 - cos) / sin);
      const totalShrink = 2 * shrinkSingle;
      const centerShift = clr * tanHalf;
      const dist = b.distance / sin;
      const adjCenter = currentPos + totalShrink;
      const halfWidth = b.val3 / 2;
      const M2 = adjCenter - halfWidth;
      const M3 = adjCenter + halfWidth;
      const M1 = M2 - dist - centerShift;
      const M4 = M3 + dist + centerShift;
      instruction += `- Угол: ${b.angleDeg}°\n`;
      instruction += `- Метки:\n  M1 = ${formatInches(M1)}, M2 = ${formatInches(M2)}, M3 = ${formatInches(M3)}, M4 = ${formatInches(M4)}.\n`;
      instruction += `- Делайте сгибы по меткам, контролируйте равномерность.\n\n`;
      currentPos = adjCenter;
    } else {
      instruction += `- Тип изгиба не поддерживается\n\n`;
    }
  });

  multiResultsDiv.style.display = 'block';
  multiResultsDiv.innerHTML = instruction.replace(/\n/g, '<br>');
}

// Инициализация первого изгиба при загрузке
addMultiBend();

// ------------------------------
// Вкладка 4: Параллельные трассы
// ------------------------------
let parallelPipeCount = 0;
const parallelPipesContainer = document.getElementById('parallel-pipes-container');

function createParallelPipeInput(id) {
  const div = document.createElement('div');
  div.classList.add('parallel-pipe-row');
  div.style.marginBottom = '12px';

  div.innerHTML = `
    <label>Труба #${id + 1} — Тип трубы</label>
    <select class="parallel-pipe-type" data-id="${id}">
      <option value="emt">EMT</option>
      <option value="imc">IMC</option>
      <option value="rigid">Rigid</option>
    </select>
    <label>Размер трубы</label>
    <select class="parallel-pipe-size" data-id="${id}"></select>
    <button class="parallel-remove-pipe-btn" data-id="${id}" style="margin-top:6px;">Удалить трубу</button>
  `;
  return div;
}

function populateParallelPipeSizes(id) {
  const typeSel = document.querySelector(`select.parallel-pipe-type[data-id="${id}"]`);
  const sizeSel = document.querySelector(`select.parallel-pipe-size[data-id="${id}"]`);
  sizeSel.innerHTML = '';
  const type = typeSel.value;
  for (let sz in conduitSpecs[type]) {
    let opt = document.createElement('option');
    opt.value = sz;
    opt.textContent = `${sz}" (Take-up: ${conduitSpecs[type][sz].takeup}", CLR: ${conduitSpecs[type][sz].clr}")`;
    sizeSel.appendChild(opt);
  }
}

function addParallelPipe() {
  const newId = parallelPipeCount++;
  const row = createParallelPipeInput(newId);
  parallelPipesContainer.appendChild(row);
  populateParallelPipeSizes(newId);

  document.querySelector(`select.parallel-pipe-type[data-id="${newId}"]`).addEventListener('change', () => {
    populateParallelPipeSizes(newId);
  });

  row.querySelector('.parallel-remove-pipe-btn').addEventListener('click', () => {
    row.remove();
  });
}
document.getElementById('parallel-add-pipe-btn').addEventListener('click', addParallelPipe);

function calculateParallelRun() {
  const spacingMode = document.getElementById('parallel-spacing-mode').value;
  const basePoint = getSplitVal('parallel-base-point-whole', 'parallel-base-point-frac');
  const rise = getSplitVal('parallel-rise-whole', 'parallel-rise-frac');
  const angleDeg = parseFloat(document.getElementById('parallel-angle').value);
  const bendType = document.getElementById('parallel-bend-type').value;

  const pipes = [];
  const pipeRows = parallelPipesContainer.querySelectorAll('.parallel-pipe-row');
  if (pipeRows.length === 0) {
    alert('Добавьте хотя бы одну трубу.');
    return;
  }

  for (let row of pipeRows) {
    const id = row.querySelector('select.parallel-pipe-type').getAttribute('data-id');
    const type = row.querySelector(`select.parallel-pipe-type[data-id="${id}"]`).value;
    const size = row.querySelector(`select.parallel-pipe-size[data-id="${id}"]`).value;
    const specs = conduitSpecs[type][size];
    if (!specs) {
      alert(`Выберите тип и размер трубы для трубы #${parseInt(id) + 1}`);
      return;
    }
    pipes.push({ id, type, size, specs });
  }

  let gap = 0;
  if (spacingMode === 'uniform') {
    gap = getSplitVal('parallel-gap-whole', 'parallel-gap-frac');
  }

  let instructions = `Параллельные трассы с ${pipes.length} трубами\n\n`;
  instructions += `Тип изгиба: ${bendType}\n`;
  instructions += `Отступ между трубами: ${formatInches(gap)} (если выбран одинаковый режим)\n`;
  instructions += `Базовая точка старта: ${formatInches(basePoint)}\n`;
  instructions += `Высота подъема: ${formatInches(rise)}\n`;
  instructions += `Угол изгиба: ${angleDeg}°\n\n`;

  let currentOffset = 0;
  for (let pipe of pipes) {
    const { takeup, clr } = pipe.specs;

    instructions += `Труба #${parseInt(pipe.id) + 1} (${pipe.type.toUpperCase()} ${pipe.size}"):\n`;

    let bendInstruction = '';

    if (bendType === 'stub') {
      const markPos = basePoint + currentOffset - takeup;
      bendInstruction =
        `1) Отмерьте от торца трубы ${formatInches(markPos)} и сделайте метку.\n` +
        `2) Установите трубу в трубогиб так, чтобы метка совпала со стрелкой.\n` +
        `3) Согните трубу ровно на 90°.\n`;
    } else if (bendType === 'offset') {
      const rad = angleDeg * Math.PI / 180;
      const sinA = Math.sin(rad);
      const cosA = Math.cos(rad);
      const tanHalfA = Math.tan(rad / 2);
      const hyp = rise / sinA;
      const adj = hyp * cosA;
      const shrink = hyp - adj;
      const centerShift = clr * tanHalfA;
      const M1 = basePoint + currentOffset + shrink - centerShift;
      const M2 = M1 + hyp;

      bendInstruction =
        `1) Отметьте метку M1: ${formatInches(M1)} от торца трубы.\n` +
        `2) Поместите трубу так, чтобы метка M1 совпала со стрелкой инструмента.\n` +
        `3) Аккуратно согните трубу на угол ${angleDeg}°.\n` +
        `4) Поверните трубу на 180° и отметьте метку M2: ${formatInches(M2)}.\n` +
        `5) Совместите метку M2 со стрелкой и согните трубу вновь на ${angleDeg}°.\n`;
    } else {
      bendInstruction = 'Режим изгиба пока не поддерживает подробную инструкцию.\n';
    }

    instructions += bendInstruction + '\n';
    currentOffset += gap + clr;
  }

  const resultsDiv = document.getElementById('parallel-results');
  resultsDiv.style.display = 'block';
  resultsDiv.innerHTML = instructions.replace(/\n/g, '<br>');
}
document.getElementById('parallel-calc-btn').addEventListener('click', calculateParallelRun);
// Добавляем первую трубу при загрузке
addParallelPipe();
