let gameState = {
    timeLeft: 60,
    wpm: 0,
    accuracy: 100,
    isGameActive: false,
    interval: null,
    startTime: 0,
    correctChars: 0,
    totalChars: 0,
    wordsTyped: 0
};

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog",
    "Pack my box with five dozen liquor bottles",
    "Five or six or seven or eight or more or less",
    "Sphinx of black quartz, vex nymphs",
    "How vexingly quick daft zebras jump",
    "The five boxing wizards jump quickly",
    "Weird characters cause trouble for gulls",
    "Jackdaws love my big sphinx of quartz"
];

function startGame() {
    if (gameState.isGameActive) return;

    gameState.isGameActive = true;
    gameState.timeLeft = 60;
    gameState.wpm = 0;
    gameState.accuracy = 100;
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.wordsTyped = 0;

    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    document.getElementById('text-to-type').textContent = randomText;

    document.getElementById('input-field').disabled = false;
    document.getElementById('input-field').value = '';
    document.getElementById('input-field').focus();
    document.getElementById('start-btn').textContent = 'Playing...';
    document.getElementById('start-btn').disabled = true;

    gameState.startTime = Date.now();
    gameState.interval = setInterval(updateTimer, 1000);

    updateDisplay();
}

function updateTimer() {
    gameState.timeLeft--;
    updateDisplay();

    if (gameState.timeLeft <= 0) {
        endGame();
    }
}

function updateDisplay() {
    document.getElementById('wpm').textContent = `WPM: ${gameState.wpm}`;
    document.getElementById('accuracy').textContent = `Accuracy: ${gameState.accuracy}%`;
    document.getElementById('time').textContent = `Time: ${gameState.timeLeft}s`;

    const textElement = document.getElementById('text-to-type');
    const inputValue = document.getElementById('input-field').value;
    const originalText = textElement.textContent;

    let highlightedText = '';
    for (let i = 0; i < originalText.length; i++) {
        if (i < inputValue.length) {
            if (inputValue[i] === originalText[i]) {
                highlightedText += `<span class="correct">${originalText[i]}</span>`;
                gameState.correctChars++;
            } else {
                highlightedText += `<span class="incorrect">${originalText[i]}</span>`;
            }
        } else {
            highlightedText += originalText[i];
        }
    }
    textElement.innerHTML = highlightedText + (gameState.isGameActive ? '|': '');

    updateStats();
}

function updateStats() {
    const elapsedSeconds = ((Date.now() - gameState.startTime) / 1000) || 1;
    gameState.wpm = Math.round((gameState.wordsTyped / elapsedSeconds) * 60);

    if (gameState.totalChars > 0) {
        gameState.accuracy = Math.round((gameState.correctChars / gameState.totalChars) * 100);
    }
}

function handleInput(e) {
    if (!gameState.isGameActive) return;

    const inputValue = e.target.value;
    gameState.totalChars = inputValue.length;

    const words = inputValue.trim().split(/\s+/);
    gameState.wordsTyped = words.length;

    if (inputValue.length >= 5) {
        document.getElementById('start-btn').disabled = false;
    }
}

function endGame() {
    gameState.isGameActive = false;
    clearInterval(gameState.interval);

    document.getElementById('input-field').disabled = true;
    document.getElementById('start-btn').textContent = 'Start Game';
    document.getElementById('start-btn').disabled = false;

    const textElement = document.getElementById('text-to-type');
    textElement.innerHTML = textElement.innerHTML.replace('<span class="correct">', '').replace('<span class="incorrect">', '');

    updateDisplay();
}

function resetGame() {
    gameState.isGameActive = false;
    clearInterval(gameState.interval);

    gameState.timeLeft = 60;
    gameState.wpm = 0;
    gameState.accuracy = 100;
    gameState.correctChars = 0;
    gameState.totalChars = 0;
    gameState.wordsTyped = 0;

    document.getElementById('input-field').disabled = true;
    document.getElementById('input-field').value = '';
    document.getElementById('text-to-type').textContent = 'Press Start to begin';
    document.getElementById('start-btn').textContent = 'Start Game';

    updateDisplay();
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('input-field').addEventListener('input', handleInput);

updateDisplay();