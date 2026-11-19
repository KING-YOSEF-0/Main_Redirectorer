// Advanced UI Controller for 3D Game
// Manages game UI components, overlays, and user interface elements

class ScoreDisplay {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.currentScore = 0;
        this.scoreHistory = [];
        this.isAnimating = false;
        this.animationFrame = null;
        this.formatScore = this.formatScore;
    }

    updateScore(newScore) {
        if (this.currentScore !== newScore) {
            this.isAnimating = true;
            const difference = newScore - this.currentScore;
            this.currentScore = newScore;

            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }

            this.animationFrame = requestAnimationFrame(() => this.animateScoreChange());
        } else {
            this.element.textContent = this.formatScore(this.currentScore);
        }
    }

    animateScoreChange() {
        this.isAnimating = false;
        this.element.textContent = this.formatScore(this.currentScore);
    }

    formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    getCurrentScore() {
        return this.currentScore;
    }

    setScore(score) {
        this.currentScore = score;
        this.element.textContent = this.formatScore(this.currentScore);
    }

    getHistory() {
        return [...this.scoreHistory];
    }

    clearHistory() {
        this.scoreHistory = [];
    }
}

class HealthDisplay {
    constructor(elementId, maxLives = 3) {
        this.element = document.getElementById(elementId);
        this.maxLives = maxLives;
        this.currentLives = maxLives;
        this.hearts = [];
        this.animations = [];
        this.render();
    }

    render() {
        this.element.innerHTML = '';
        this.hearts = [];

        for (let i = 0; i < this.maxLives; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.innerHTML = '❤️';
            heart.style.opacity = i < this.currentLives ? '1' : '0.3';
            heart.style.transition = 'opacity 0.3s ease';

            if (i < this.currentLives - 1) {
                heart.classList.add('pulse');
            }

            this.element.appendChild(heart);
            this.hearts.push(heart);
        }
    }

    setLives(lives, maxLives) {
        this.currentLives = Math.min(lives, maxLives);
        this.maxLives = maxLives;
        this.render();
    }

    loseLife() {
        if (this.currentLives > 0) {
            this.currentLives--;
            this.render();

            // Trigger animation
            if (this.hearts[this.currentLives]) {
                this.hearts[this.currentLives].style.animation = 'heartBeat 0.3s ease';
                setTimeout(() => {
                    if (this.hearts[this.currentLives]) {
                        this.hearts[this.currentLives].style.animation = '';
                    }
                }, 300);
            }
        }
    }

    gainLife() {
        if (this.currentLives < this.maxLives) {
            this.currentLives++;
            this.render();

            // Trigger animation
            if (this.hearts[this.currentLives - 1]) {
                this.hearts[this.currentLives - 1].style.animation = 'heartBeat 0.5s ease';
                setTimeout(() => {
                    if (this.hearts[this.currentLives - 1]) {
                        this.hearts[this.currentLives - 1].style.animation = '';
                    }
                }, 500);
            }
        }
    }

    getLives() {
        return this.currentLives;
    }

    isEmpty() {
        return this.currentLives <= 0;
    }
}

class GameHUD {
        this.container = document.createElement('div');
        this.container.className = 'game-hud';
        this.container.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            pointer-events: none;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
        `;

        this.scoreDisplay = null;
        this.healthDisplay = null;
        this.timerDisplay = null;
        this.levelDisplay = null;
        this.performanceDisplay = null;

        this.stats = {
            score: 0,
            lives: 3,
            level: 1,
            timeRemaining: 0,
            fps: 60
        };
    }

    addTo(container) {
        container.appendChild(this.container);
    }

    createScoreDisplay() {
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'hud-element score-element';
        this.scoreDisplay.innerHTML = `
            <div class="hud-label">SCORE</div>
            <div class="hud-value score-value" id="score-value">0</div>
        `;
        this.scoreDisplay.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
            border: 2px solid rgba(56, 189, 248, 0.3);
            border-radius: 12px;
            padding: 16px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const label = this.scoreDisplay.querySelector('.hud-label');
        const value = this.scoreDisplay.querySelector('.hud-value');

        label.style.cssText = `
            color: #94a3b8;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        `;

        value.style.cssText = `
            color: #38bdf8;
            font-size: 2rem;
            font-weight: 800;
            font-family: 'Fira Code', monospace;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
        `;

        this.container.appendChild(this.scoreDisplay);
        return this.scoreDisplay;
    }

    createHealthDisplay() {
        this.healthDisplay = document.createElement('div');
        this.healthDisplay.className = 'hud-element health-element';
        this.healthDisplay.innerHTML = `
            <div class="hud-label">LIVES</div>
            <div class="hearts-container" id="hearts-container"></div>
        `;
        this.healthDisplay.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
            border: 2px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 140px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const label = this.healthDisplay.querySelector('.hud-label');
        const heartsContainer = this.healthDisplay.querySelector('#hearts-container');

        label.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 12px;
        `;

        heartsContainer.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        this.container.appendChild(this.healthDisplay);
        return this.healthDisplay;
    }

    createTimerDisplay() {
        this.timerDisplay = document.createElement('div');
        this.timerDisplay.className = 'hud-element timer-element';
        this.timerDisplay.innerHTML = `
            <div class="hud-label">TIME</div>
            <div class="hud-value timer-value" id="timer-value">05:00</div>
        `;
        this.timerDisplay.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
            border: 2px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 16px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const label = this.timerDisplay.querySelector('.hud-label');
        const value = this.timerDisplay.querySelector('.hud-value');

        label.style.cssText = `
            color: #22c55e;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        `;

        value.style.cssText = `
            color: #4ade80;
            font-size: 1.5rem;
            font-weight: 700;
            font-family: 'Fira Code', monospace;
        `;

        this.container.appendChild(this.timerDisplay);
        return this.timerDisplay;
    }

    createLevelDisplay() {
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'hud-element level-element';
        this.levelDisplay.innerHTML = `
            <div class="hud-label">LEVEL</div>
            <div class="hud-value level-value" id="level-value">1</div>
        `;
        this.levelDisplay.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
            border: 2px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            padding: 16px 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const label = this.levelDisplay.querySelector('.hud-label');
        const value = this.levelDisplay.querySelector('.hud-value');

        label.style.cssText = `
            color: #a855f7;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        `;

        value.style.cssText = `
            color: #c084fc;
            font-size: 2rem;
            font-weight: 800;
            font-family: 'Fira Code', monospace;
            text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
        `;

        this.container.appendChild(this.levelDisplay);
        return this.levelDisplay;
    }

    createPerformanceDisplay() {
        this.performanceDisplay = document.createElement('div');
        this.performanceDisplay.className = 'hud-element performance-element';
        this.performanceDisplay.innerHTML = `
            <div class="hud-label">FPS</div>
            <div class="hud-value performance-value" id="fps-value">60</div>
        `;
        this.performanceDisplay.style.cssText = `
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
            border: 2px solid rgba(251, 146, 60, 0.3);
            border-radius: 12px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 100px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;

        const label = this.performanceDisplay.querySelector('.hud-label');
        const value = this.performanceDisplay.querySelector('.hud-value');

        label.style.cssText = `
            color: #fb923c;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
        `;

        value.style.cssText = `
            color: #fdba74;
            font-size: 1.25rem;
            font-weight: 700;
            font-family: 'Fira Code', monospace;
        `;

        this.container.appendChild(this.performanceDisplay);
        return this.performanceDisplay;
    }

    update(stats) {
        this.stats = { ...this.stats, ...stats };

        if (this.scoreDisplay) {
            const scoreValue = this.scoreDisplay.querySelector('#score-value');
            if (scoreValue) {
                scoreValue.textContent = this.stats.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }
        }

        if (this.healthDisplay) {
            const heartsContainer = this.healthDisplay.querySelector('#hearts-container');
            if (heartsContainer) {
                heartsContainer.innerHTML = '';
                for (let i = 0; i < this.stats.lives; i++) {
                    const heart = document.createElement('span');
                    heart.innerHTML = '❤️';
                    heart.style.cssText = `
                        color: #ef4444;
                        font-size: 1.5rem;
                        animation: heartBeat 0.3s ease infinite;
                        animation-delay: ${i * 0.1}s;
                    `;
                    heartsContainer.appendChild(heart);
                }
            }
        }

        if (this.timerDisplay) {
            const timerValue = this.timerDisplay.querySelector('#timer-value');
            if (timerValue) {
                timerValue.textContent = this.stats.timeRemaining >= 600
                    ? `${Math.floor(this.stats.timeRemaining / 60)}:${(this.stats.timeRemaining % 60).toString().padStart(2, '0')}`
                    : `${Math.floor(this.stats.timeRemaining / 60)}:${(this.stats.timeRemaining % 60).toString().padStart(2, '0')}`;
            }
        }

        if (this.levelDisplay) {
            const levelValue = this.levelDisplay.querySelector('#level-value');
            if (levelValue) {
                levelValue.textContent = this.stats.level.toString();
            }
        }

        if (this.performanceDisplay) {
            const fpsValue = this.performanceDisplay.querySelector('#fps-value');
            if (fpsValue) {
                fpsValue.textContent = this.stats.fps.toString();
                fpsValue.style.color = this.stats.fps >= 50 ? '#4ade80' : this.stats.fps >= 30 ? '#fbbf24' : '#ef4444';
            }
        }
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }

    destroy() {
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

class InputPrompt {
        this.container = document.createElement('div');
        this.container.className = 'input-prompt';
        this.container.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 23, 42, 0.95);
            border: 2px solid rgba(56, 189, 248, 0.5);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            z-index: 2000;
            display: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            font-family: 'Inter', sans-serif;
            backdrop-filter: blur(10px);
        `;
    }

    show(message, onConfirm, onCancel) {
        this.container.innerHTML = `
            <div style="margin-bottom: 24px;">
                <h3 style="color: #38bdf8; font-size: 1.5rem; margin-bottom: 16px;">Game Prompt</h3>
                <p style="color: #e2e8f0; font-size: 1.1rem; line-height: 1.6;">${message}</p>
            </div>
            <div style="display: flex; gap: 16px; justify-content: center;">
                <button id="confirm-btn" style="
                    padding: 12px 32px;
                    background: linear-gradient(135deg, #38bdf8, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Confirm</button>
                <button id="cancel-btn" style="
                    padding: 12px 32px;
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">Cancel</button>
            </div>
        `;

        document.body.appendChild(this.container);
        this.container.style.display = 'block';

        const confirmBtn = this.container.querySelector('#confirm-btn');
        const cancelBtn = this.container.querySelector('#cancel-btn');

        const confirmHandler = () => {
            this.hide();
            if (onConfirm) onConfirm();
        };

        const cancelHandler = () => {
            this.hide();
            if (onCancel) onCancel();
        };

        confirmBtn.addEventListener('click', confirmHandler);
        cancelBtn.addEventListener('click', cancelHandler);

        this.container.onclick = (e) => {
            if (e.target === this.container) {
                this.hide();
                if (onCancel) onCancel();
            }
        };
    }

    hide() {
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameHUD,
        ScoreDisplay,
        HealthDisplay,
        InputPrompt
    };
}

// Global export for browser environments
if (typeof window !== 'undefined') {
    window.GameUI = {
        GameHUD,
        ScoreDisplay,
        HealthDisplay,
        InputPrompt
    };
}