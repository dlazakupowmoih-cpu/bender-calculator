// --------- Вкладка 2: Расчет угла по трём измерениям ---------
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
    `<b>Инструкция для работы с углом:</b><br>` +
    `1) Измерьте высоту подъема, ширину и длину участка с точностью.<br>` +
    `2) Используйте рассчитанный точный угол для настройки углов изгиба.<br>` +
    `3) При разметке и монтаже опирайтесь на эти данные для точной установки труб.`;
}

document.getElementById('angle-calc-btn').addEventListener('click', calculate3DAngle);

// --------- Вкладка 3: Multi-Run (Цепочка изгибов) ---------
const multiBendsContainer = document.getElementById('multi-bends-container');
const multiErrorContainer = document.getElementById('multi-error-container');
const multiResultsDiv = document.getElementById('multi-results');
let multiBendCount = 0;

function createMultiBendRow(id) {
  const div = document.createElement('div');
  div.classList.add('multi-bend-row');
  div.style.marginBottom = '12px';

  div.innerHTML = `
    <label>Изгиб #${id + 1} — Угол (градусы)</label>
    <select class="multi-bend-angle" data-id="${id}">
      <option value="10">10°</option>
      <option value="22.5" selected>22.5°</option>
      <option value="30">30°</option>
      <option value="45">45°</option>
      <option value="custom">Кастомный...</option>
    </select>
    <div class="custom-angle-wrapper" style="display:none; margin-top:6px;">
      <input type="range" min="1" max="89" step="0.5" value="22.5" class="multi-bend-custom-slider" data-id="${id}"/>
      <input type="number" min="1" max="89" step="0.5" value="22.5" class="multi-bend-custom-number" data-id="${id}"/>
    </div>
    <label>Расстояние до изгиба (дюймы)</label>
    <div class="inch-split">
      <input type="number" class="multi-bend-dist-whole" min="0" value="6" data-id="${id}" />
      <select class="multi-bend-dist-frac" data-id="${id}"></select>
    </div>
    <button class="multi-remove-bend-btn" data-id="${id}" style="margin-top:6px;">Удалить изгиб</button>
  `;
  return div;
}

function addMultiBend() {
  const newId = multiBendCount++;
  const row = createMultiBendRow(newId);
  multiBendsContainer.appendChild(row);
  populateMultiFractionSelect(row.querySelector(`select.multi-bend-dist-frac[data-id="${newId}"]`));
  attachMultiBendListeners(row, newId);
}

function populateMultiFractionSelect(sel){
  sel.innerHTML='';
  fractionOptions.forEach(fr=>{
    let opt=document.createElement('option');
    opt.value=fr.value;
    opt.textContent=fr.label;
    sel.appendChild(opt);
  });
}

function attachMultiBendListeners(row, id) {
  const angleSelect = row.querySelector(`select.multi-bend-angle[data-id="${id}"]`);
  const slider = row.querySelector(`input.multi-bend-custom-slider[data-id="${id}"]`);
  const numberInput = row.querySelector(`input.multi-bend-custom-number[data-id="${id}"]`);
  const fracSelect = row.querySelector(`select.multi-bend-dist-frac[data-id="${id}"]`);
  const distWholeInput = row.querySelector(`input.multi-bend-dist-whole[data-id="${id}"]`);
  const customWrapper = row.querySelector('.custom-angle-wrapper');

  angleSelect.addEventListener('change', () => {
    if (angleSelect.value === 'custom') {
      customWrapper.style.display = 'flex';
    } else {
      customWrapper.style.display = 'none';
    }
  });

  slider.oninput = () => {
    numberInput.value = slider.value;
  };

  numberInput.oninput = () => {
    let val = parseFloat(numberInput.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 89) val = 89;
    slider.value = val;
    numberInput.value = val;
  };

  fracSelect.innerHTML = '';
  fractionOptions.forEach(fr => {
    let opt = document.createElement('option');
    opt.value = fr.value;
    opt.textContent = fr.label;
    fracSelect.appendChild(opt);
  });

  row.querySelector('.multi-remove-bend-btn').addEventListener('click', () => {
    row.remove();
  });
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
  let error = '';

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
    let angleSel = row.querySelector(`select.multi-bend-angle[data-id="${id}"]`);
    let angleDeg = angleSel.value === 'custom' ? parseFloat(row.querySelector(`input.multi-bend-custom-number[data-id="${id}"]`).value) : parseFloat(angleSel.value);
    if (isNaN(angleDeg) || angleDeg <= 0) angleDeg = 30;

    let distWhole = parseFloat(row.querySelector(`input.multi-bend-dist-whole[data-id="${id}"]`).value);
    let distFrac = parseFloat(row.querySelector(`select.multi-bend-dist-frac[data-id="${id}"]`).value);
    if (isNaN(distWhole)) distWhole = 0;
    if (isNaN(distFrac)) distFrac = 0;

    const distance = distWhole + distFrac;
    bends.push({ angleDeg, distance });
  }

  // Расчет последовательных меток и инструкций
  let currentPos = 0;
  let instruction = `Тип трубы/размер: ${ctype.toUpperCase()} ${csize}" (Take-up: ${takeup}", CLR: ${clr}")\n`;
  instruction += `Multi-Run, количество изгибов: ${bends.length}\n\n`;

  bends.forEach((bend, idx) => {
    const angleRad = bend.angleDeg * Math.PI / 180;
    const sin = Math.sin(angleRad);
    const cos = Math.cos(angleRad);
    const tanHalf = Math.tan(angleRad / 2);
    const hyp = bend.distance / sin;
    const adj = hyp * cos;
    const shrink = hyp - adj;
    const centerShift = clr * tanHalf;

    const M1 = currentPos + shrink - centerShift;
    const M2 = M1 + hyp;

    instruction += `Изгиб #${idx + 1}:\n`;
    instruction += `- Угол сгиба: ${bend.angleDeg}°\n`;
    instruction += `- Отметьте метку <span style="font-weight:bold; color:#fbbf24;">M1 = ${formatInches(M1)}</span> от торца трубы.\n`;
    instruction += `- Вставьте трубу так, чтобы метка M1 совпала со стрелкой.\n`;
    instruction += `- Аккуратно согните трубу на угол ${bend.angleDeg}°.\n`;
    instruction += `- Поверните трубу на 180°.\n`;
    instruction += `- Отметьте метку <span style="font-weight:bold; color:#fbbf24;">M2 = ${formatInches(M2)}</span>, совместите её со стрелкой.\n`;
    instruction += `- Сгибайте трубу снова на угол ${bend.angleDeg}°.\n\n`;

    currentPos = M2;
  });

  multiResultsDiv.style.display = 'block';
  multiResultsDiv.innerHTML = instruction.replace(/\n/g, '<br>');
}
document.getElementById('multi-calc-btn').addEventListener('click', calculateMultiRun);

// --------- Вкладка 4: Параллельные трассы ---------
const parallelPipesContainer = document.getElementById('parallel-pipes-container');
let parallelPipeCount = 0;

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

  const typeSel = row.querySelector(`select.parallel-pipe-type[data-id="${newId}"]`);
  typeSel.addEventListener('change', () => populateParallelPipeSizes(newId));

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

  // Вычисляем отступы между трубами
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

// Инициализация первого изгиба и первой трубы
addMultiBend();
addParallelPipe();

// ---------------- Таб переключение ----------------
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const tabId = e.currentTarget.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});
