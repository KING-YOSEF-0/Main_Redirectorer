const display = document.getElementById('display');
let expression = '';

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.innerText;

        if (val === 'AC') {
            expression = '';
        } else if (val === 'DEL') {
            expression = expression.slice(0, -1);
        } else if (val === '=') {
            try {
                expression = math.evaluate(expression).toString();
            } catch {
                expression = 'Syntax Error';
            }
        } else {
            expression += val;
        }
        display.innerText = expression || '0';
    });
});