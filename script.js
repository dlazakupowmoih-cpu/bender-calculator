// Спецификации труб (Take-up и CLR)
const conduitSpecs = {
  emt: { '1/2': { takeup: 5, clr: 4.0 }, '3/4': { takeup: 6, clr: 4.375 }, '1': { takeup: 8, clr: 5.75 }, '1-1/4': { takeup: 11, clr: 7.25 }, '1-1/2': { takeup: 13, clr: 8.5 }, '2': { takeup: 16, clr: 10.5 } },
  imc: { '1/2': { takeup: 6, clr: 4.5 }, '3/4': { takeup: 8, clr: 5.5 }, '1': { takeup: 11, clr: 7.0 }, '1-1/4': { takeup: 14, clr: 8.25 }, '1-1/2': { takeup: 16, clr: 9.5 }, '2': { takeup: 20, clr: 12.0 } },
  rigid: { '1/2': { takeup: 7, clr: 4.25 }, '3/4': { takeup: 10, clr: 5.25 }, '1': { takeup: 12, clr: 6.5 }, '1-1/4': { takeup: 15, clr: 8.0 }, '1-1/2': { takeup: 18, clr: 9.25 }, '2': { takeup: 22, clr: 11.5 } }
};

// Опции дробей дюймов
const fractionOptions = [
  { value: 0, label: "0" },
  { value: 1 / 16, label: "1/16" },
  { value: 1 / 8, label: "1/8" },
  { value: 3 / 16, label: "3/16" },
  { value: 1 / 4, label: "1/4" },
  { value: 5 / 16, label: "5/16" },
  { value: 3 / 8, label: "3/8" },
  { value: 7 / 16, label: "7/16" },
  { value: 1 / 2, label: "1/2" },
  { value: 9 / 16, label: "9/16" },
  { value: 5 / 8, label: "5/8" },
  { value: 11 / 16, label: "11/16" },
  { value: 3 / 4, label: "3/4" },
  { value: 13 / 16, label: "13/16" },
  { value: 7 / 8, label: "7/8" },
  { value: 15 / 16, label: "15/16" }
];

// Заполнение селектов дробей
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

// Заполнение всех дробных селектов на странице
[
  'single-val1-frac', 'single-val2-frac', 'single-val3-frac',
  'angle-rise-frac', 'angle-width-frac', 'angle-length-frac',
  'parallel-gap-frac', 'parallel-base-point-frac', 'parallel-rise-frac'
].forEach(populateFractionSelect);

// Заполнение размеров труба (single и multi)
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

// Управление отображением ширины для saddle4
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
document.getElementById('single-bend-type').addEventListener('change', () => {
  updateSingleInputs();
  enforceAngleRestriction();
});

// Кастомный угол - показать/скрыть
const angleSelect = document.getElementById('single-bend-angle');
angleSelect.addEventListener('change', () => {
  const wrapper = document.getElementById('single-custom-angle-wrapper');
  wrapper.style.display = (angleSelect.value === 'custom') ? 'flex' : 'none';
});

// Синхронизация кастомного угла
const slider = document.getElementById('single-custom-angle-slider');
const numberInput = document.getElementById('single-custom-angle-number');
slider.oninput = () => { numberInput.value = slider.value; };
numberInput.oninput = () => {
  let val = parseFloat(numberInput.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 89) val = 89;
  slider.value = val;
  numberInput.value = val;
};

// Ограничения угла с учётом типа изгиба
function enforceAngleRestriction() {
  const bendType = document.getElementById('single-bend-type').value;
  const angleSel = document.getElementById('single-bend-angle');
  const currentVal = angleSel.value;

  for (let i = 0; i < angleSel.options.length; i++) {
    const val = angleSel.options[i].value;
    if (bendType === 'stub') {
      // Для stub доступны только 90 и кастом
      angleSel.options[i].disabled = !(val === '90' || val === 'custom');
    } else {
      // Для остальных запрещаем 90
      angleSel.options[i].disabled = (val === '90');
    }
  }

  if (bendType === 'stub') {
    if (currentVal !== '90' && currentVal !== 'custom') {
      angleSel.value = '90';
      angleSel.dispatchEvent(new Event('change'));
    } else if (currentVal === 'custom') {
      let customAngle = parseFloat(document.getElementById('single-custom-angle-number').value);
      if (customAngle !== 90) {
        alert('Для 90° Stub-up кастомный угол должен быть ровно 90°.');
        document.getElementById('single-custom-angle-number').value = 90;
        document.getElementById('single-custom-angle-slider').value = 90;
      }
    }
  } else {
    if (currentVal === '90') {
      angleSel.value = '30';
      angleSel.dispatchEvent(new Event('change'));
    }
  }
}
document.getElementById('single-bend-type').addEventListener('change', enforceAngleRestriction);
document.getElementById('single-bend-angle').addEventListener('change', enforceAngleRestriction);
enforceAngleRestriction();

// Вспомогательные функции
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
    num /= 2;
    den /= 2;
  }
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

// Функция расчета одиночного изгиба с инструкцией
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

  let res = `Тип трубы/размер: ${ctype.toUpperCase()} ${csize}" (Take-up: ${takeup}", CLR: ${clr}")\n`;
  res += `Вид изгиба: ${document.getElementById('single-bend-type').selectedOptions[0].text}\n`;
  res += `Угол изгиба: ${angleDeg}°\n\n`;

  if (type === 'stub') {
    const markPos = val1 - takeup;
    res += `Пошаговая инструкция:\n\n`;
    res += `1) Отмерьте рулеткой от торца трубы расстояние **${formatInches(markPos)}** и сделайте метку.\n`;
    res += `2) Вставьте трубу в трубогиб так, чтобы метка совпала со стрелкой (Arrow) на инструменте.\n`;
    res += `3) Убедитесь, что длинный конец трубы направлен к ручке, короткий зафиксирован.\n`;
    res += `4) Аккуратно согните трубу ровно на угол **90°**.\n`;
    res += `5) Проверьте точность изгиба и метки.\n`;
  } else if (type === 'offset') {
    const hyp = val2 / sin;
    const adj = hyp * cos;
    const shrink = hyp - adj;
    const centerShift = clr * tanHalf;
    const M1 = val1 + shrink - centerShift;
    const M2 = M1 + hyp;

    res += `Пошаговая инструкция:\n\n`;
    res += `1) Отмерьте рулеткой от торца трубы расстояние **${formatInches(M1)}** и сделайте метку <span style="font-weight:bold; color:#fbbf24;">M1</span>.\n`;
    res += `2) Поместите трубу в трубогиб так, чтобы метка <span style="font-weight:bold; color:#fbbf24;">M1</span> совпала со стрелкой (Arrow) на инструменте.\n`;
    res += `3) Проверьте правильность ориентации трубы: длинный конец к ручке, короткий — фиксирован.\n`;
    res += `4) Аккуратно согните трубу ровно на угол **${angleDeg}°**.\n`;
    res += `5) Поверните трубу на 180°.\n`;
    res += `6) Отмерьте и сделайте метку <span style="font-weight:bold; color:#fbbf24;">M2 = ${formatInches(M2)}</span>.\n`;
    res += `7) Совместите метку <span style="font-weight:bold; color:#fbbf24;">M2</span> со стрелкой.\n`;
    res += `8) Аккуратно согните трубу еще раз ровно на угол **${angleDeg}°**.\n`;
    res += `9) Проверьте точность изгиба и равномерность отступов.\n`;
  } else if (type === 'saddle3') {
    const mult = 1 / sin;
    const shrinkSingle = val2 * ((1 - cos) / sin);
    const totalShrink = 2 * shrinkSingle;
    const centerShift = clr * tanHalf;
    const dist = val2 * mult;
    const M2 = val1 + totalShrink;
    const M1 = M2 - dist - centerShift;
    const M3 = M2 + dist + centerShift;

    res += `Пошаговая инструкция:\n\n`;
    res += `1) Отмерьте рулеткой от торца трубы метки:\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M1 = ${formatInches(M1)}</span>\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M2 (центр) = ${formatInches(M2)}</span>\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M3 = ${formatInches(M3)}</span>\n`;
    res += `2) Поместите трубу так, чтобы метка <span style="font-weight:bold; color:#fbbf24;">M2</span> попала на стрелку инструмента.\n`;
    res += `3) Аккуратно согните трубу на угол **${(angleDeg * 2).toFixed(1)}°** (двойной угол).\n`;
    res += `4) Поверните трубу, совместите метки <span style="font-weight:bold; color:#fbbf24;">M1</span> и <span style="font-weight:bold; color:#fbbf24;">M3</span> со стрелкой.\n`;
    res += `5) Сгибайте каждую из этих меток по углу **${angleDeg}°**.\n`;
    res += `6) Проверьте равномерность изгиба и соответствие размерам.\n`;
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

    res += `Пошаговая инструкция:\n\n`;
    res += `1) Отмерьте рулеткой метки:\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M1 = ${formatInches(M1)}</span>\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M2 = ${formatInches(M2)}</span>\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M3 = ${formatInches(M3)}</span>\n`;
    res += `   • <span style="font-weight:bold; color:#fbbf24;">M4 = ${formatInches(M4)}</span>\n`;
    res += `2) Вставьте трубу так, чтобы метка <span style="font-weight:bold; color:#fbbf24;">M2</span> совпала со стрелкой.\n`;
    res += `3) Сделайте сгибы последовательно для меток <span style="font-weight:bold; color:#fbbf24;">M1</span>, <span style="font-weight:bold; color:#fbbf24;">M3</span>, <span style="font-weight:bold; color:#fbbf24;">M4</span>, контролируя равномерность.\n`;
    res += `4) Проверьте геометрию изгиба и соответствие заданным размерам.\n`;
  }

  const resDiv = document.getElementById('single-results');
  resDiv.style.display = 'block';
  resDiv.innerHTML = res.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

document.getElementById('single-calc-btn').addEventListener('click', calculateSingleBend);
