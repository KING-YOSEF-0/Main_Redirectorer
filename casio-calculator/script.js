const display = document.getElementById('display');
let expression = '';
let lastResult = '0';

function updateDisplay() {
    display.innerText = expression || '0';
}

// Convert degrees to radians for trig functions (Casio defaults to degrees)
function evalWithDeg(expr) {
    let deg = expr
        .replace(/sin\(/g, 'sin_deg(')
        .replace(/cos\(/g, 'cos_deg(')
        .replace(/tan\(/g, 'tan_deg(');
    return math.evaluate(deg, {
        sin_deg: x => Math.sin(x * Math.PI / 180),
        cos_deg: x => Math.cos(x * Math.PI / 180),
        tan_deg: x => Math.tan(x * Math.PI / 180),
    });
}

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.innerText;

        switch (val) {
            case 'AC':
                expression = '';
                lastResult = '0';
                break;
            case 'DEL':
                expression = expression.slice(0, -1);
                break;
            case 'ON':
                expression = '';
                lastResult = '0';
                break;
            case '=':
                try {
                    const result = evalWithDeg(expression);
                    lastResult = math.format(result, { precision: 10 });
                    expression = lastResult;
                } catch (e) {
                    expression = 'Syntax Error';
                }
                break;
            case 'Ans':
                expression += lastResult;
                break;
            case 'sin':
                expression += 'sin(';
                break;
            case 'cos':
                expression += 'cos(';
                break;
            case 'tan':
                expression += 'tan(';
                break;
            case '∫dx':
                expression += 'integrate(';
                break;
            case 'x²':
                expression += '^2';
                break;
            case 'x³':
                expression += '^3';
                break;
            case 'x⁻¹':
                expression += '^(-1)';
                break;
            case '√':
                expression += 'sqrt(';
                break;
            case 'log':
                expression += 'log10(';
                break;
            case 'log■':
                expression += 'log2(';
                break;
            case 'ln':
                expression += 'log(';
                break;
            case 'hyp':
                expression += 'hypot(';
                break;
            case '(-)':
                expression += '-(';
                break;
            case 'S⇔D':
                try {
                    const r = evalWithDeg(expression);
                    expression = math.format(r, { precision: 10 });
                } catch { expression = 'Error'; }
                break;
            case 'M+':
                expression += '+' + lastResult;
                break;
            case 'x10ˣ':
                expression += '*10^';
                break;
            default:
                expression += val;
        }
        updateDisplay();
    });
});