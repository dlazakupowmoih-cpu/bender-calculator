// Общие константы, функции и спецификации труб

const conduitSpecs = {
    emt: { 
        '1/2': {takeup: 5, clr: 4.0}, 
        '3/4': {takeup: 6, clr: 4.375}, 
        '1': {takeup: 8, clr: 5.75}, 
        '1-1/4': {takeup: 11, clr: 7.25}, 
        '1-1/2': {takeup: 13, clr: 8.5}, 
        '2': {takeup: 16, clr: 10.5} 
    },
    imc: { 
        '1/2': {takeup: 6, clr: 4.5}, 
        '3/4': {takeup: 8, clr: 5.5}, 
        '1': {takeup: 11, clr: 7.0}, 
        '1-1/4': {takeup: 14, clr: 8.25}, 
        '1-1/2': {takeup: 16, clr: 9.5}, 
        '2': {takeup: 20, clr: 12.0} 
    },
    rigid: { 
        '1/2': {takeup: 7, clr: 4.25}, 
        '3/4': {takeup: 10, clr: 5.25}, 
        '1': {takeup: 12, clr: 6.5}, 
        '1-1/4': {takeup: 15, clr: 8.0}, 
        '1-1/2': {takeup: 18, clr: 9.25}, 
        '2': {takeup: 22, clr: 11.5} 
    }
};

// Функция для форматирования дюймов в дробные
function formatInches(inches) {
    if (inches < 0) inches = 0;
    const totalSixteenths = Math.round(inches * 16);
    const whole = Math.floor(totalSixteenths / 16);
    let rem = totalSixteenths % 16;
    if (rem === 0) return whole > 0 ? `${whole}"` : `0"`;
    let num = rem, den = 16;
    while (num % 2 === 0 && den % 2 === 0) {
        num /= 2;
        den /= 2;
    }
    return whole === 0 ? `${num}/${den}"` : `${whole} ${num}/${den}"`;
}

// Возвращает значение из двух инпутов в дробном формате: целое + дробь
function getSplitVal(wholeId, fracId) {
    const whole = parseFloat(document.getElementById(wholeId).value) || 0;
    const frac = parseFloat(document.getElementById(fracId).value) || 0;
    return whole + frac;
}

// Заполнение селектов дробей 16-ых
function populateFractionSelects(selector = '.frac-select') {
    const optionsHtml = `
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
    document.querySelectorAll(selector).forEach(sel => {
        const val = sel.value;
        sel.innerHTML = optionsHtml;
        if (val) sel.value = val;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateFractionSelects();
});
