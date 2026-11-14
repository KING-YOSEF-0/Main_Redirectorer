const display = document.getElementById('main-row');
let currentInput = '';

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.innerText;

        if (value === 'AC') {
            currentInput = '';
        } else if (value === 'DEL') {
            currentInput = currentInput.slice(0, -1);
        } else if (value === '=') {
            try {
                currentInput = eval(currentInput).toString();
            } catch {
                currentInput = 'Error';
            }
        } else {
            currentInput += value;
        }
        display.innerText = currentInput || '0';
    });
});