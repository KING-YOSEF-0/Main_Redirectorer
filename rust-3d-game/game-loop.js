// Advanced Game Loop Controller
// Manages game states, transitions, and core game mechanics

class GameTimer {
    constructor() {
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        this.deltaTime = 0;
        this.totalTime = 0;
        this.frames = 0;
        this.fps = 0;
        this.targetFPS = 60;
        this.timeScale = 1.0;
    }

    update() {
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1); // Cap at 100ms
        this.lastFrameTime = currentTime;
        this.totalTime += this.deltaTime;
        this.frames++;

        // Update FPS every second
        if (this.totalTime >= 1.0) {
            this.fps = Math.round((this.frames / this.totalTime) * 10) / 10;
            this.frames = 0;
            this.totalTime = 0;
        }
    }

    setTimeScale(scale) {
        this.timeScale = Math.max(0, Math.min(2, scale));
    }

    get smoothedDeltaTime() {
        return this.deltaTime * this.timeScale;
    }

    get smoothedFps() {
        return this.fps;
    }
}

class GameState {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 1;
        this.totalScore = 0;
        this.lives = 3;
        this.timeLimit = 300; // 5 minutes in seconds
        this.startTime = 0;
        this.gameTime = 0;
        this.stateHistory = [];
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.stateHistory.push({
            timestamp: Date.now(),
            state: 'running'
        });
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.stateHistory.push({
                timestamp: Date.now(),
                state: 'paused'
            });
        }
    }

    resume() {
        if (this.isRunning && this.isPaused) {
            this.isPaused = false;
            this.stateHistory.push({
                timestamp: Date.now(),
                state: 'resumed'
            });
        }
    }

    end() {
        this.isRunning = false;
        this.isPaused = false;
        this.stateHistory.push({
            timestamp: Date.now(),
            state: 'ended'
        });
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.startTime) / 1000);

        // Check time limit
        if (this.gameTime >= this.timeLimit) {
            this.end();
            return;
        }
    }

    addScore(points) {
        this.totalScore += points;
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.end();
        }
    }

    levelUp() {
        this.currentLevel++;
        this.timeLimit += 30; // Additional time for next level
        // Increase difficulty
    }

    getTimeRemaining() {
        return Math.max(0, this.timeLimit - this.gameTime);
    }

    getFormattedTime() {
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    getStats() {
        return {
            level: this.currentLevel,
            score: this.totalScore,
            lives: this.lives,
            timeRemaining: this.getTimeRemaining(),
            gameTime: this.gameTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused
        };
    }
}

class EventManager {
    constructor() {
        this.listeners = {};
        this.eventHistory = [];
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const eventData = {
            event,
            data,
            timestamp: Date.now()
        };
        this.eventHistory.push(eventData);

        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    clear() {
        this.listeners = {};
        this.eventHistory = [];
    }

    getEventHistory() {
        return [...this.eventHistory];
    }

    getEventCount(event) {
        return this.eventHistory.filter(e => e.event === event).length;
    }
}

class GameLoop {
    constructor(updateCallback, renderCallback, inputCallback) {
        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.inputCallback = inputCallback;

        this.timer = new GameTimer();
        this.state = new GameState();
        this.events = new EventManager();

        this.animationFrameId = null;
        this.isRunning = false;
        this.lastTime = 0;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = performance.now();
        this.state.start();
        this.events.emit('game_started', { state: this.state.getStats() });

        this.loop();
    }

    loop() {
        if (!this.isRunning) return;

        requestAnimationFrame((currentTime) => {
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // Update game logic
            this.timer.update();
            this.state.update();
            this.inputCallback(deltaTime);

            // Emit update event
            this.events.emit('game_update', {
                deltaTime: this.timer.smoothedDeltaTime,
                state: this.state.getStats(),
                timer: {
                    fps: this.timer.smoothedFps,
                    totalTime: this.timer.totalTime
                }
            });

            // Render frame
            this.renderCallback(deltaTime);

            // Check if game is still running
            if (this.state.isRunning) {
                this.loop();
            } else {
                this.events.emit('game_ended', { finalScore: this.state.totalScore });
            }
        });
    }

    pause() {
        if (this.isRunning && !this.state.isPaused) {
            this.state.pause();
            this.events.emit('game_paused', { state: this.state.getStats() });
        }
    }

    resume() {
        if (this.isRunning && this.state.isPaused) {
            this.state.resume();
            this.events.emit('game_resumed', { state: this.state.getStats() });
            this.lastTime = performance.now();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.state.end();
        this.events.emit('game_stopped', { finalScore: this.state.totalScore });
    }

    addEventListener(event, callback) {
        this.events.on(event, callback);
    }

    removeEventListener(event, callback) {
        this.events.off(event, callback);
    }

    getState() {
        return this.state.getStats();
    }

    updatePlayerState(playerState) {
        this.events.emit('player_update', playerState);
    }

    updateScore(points) {
        this.state.addScore(points);
        this.events.emit('score_update', { score: this.state.totalScore });
    }

    loseLife() {
        this.state.loseLife();
        this.events.emit('life_lost', { lives: this.state.lives });

        if (!this.state.isRunning) {
            this.events.emit('game_over', { score: this.state.totalScore });
        }
    }

    levelComplete() {
        this.state.levelUp();
        this.events.emit('level_complete', { level: this.state.currentLevel });
    }

    getEventHistory() {
        return this.events.getEventHistory();
    }

    getPerformanceStats() {
        return {
            fps: this.timer.smoothedFps,
            averageFrameTime: 1000 / this.timer.smoothedFps,
            totalFrames: this.timer.frames,
            gameTime: this.timer.totalTime
        };
    }
}

// Export for CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameLoop,
        GameTimer,
        GameState,
        EventManager
    };
}

// Global export for browser environments
if (typeof window !== 'undefined') {
    window.GameCore = {
        GameLoop,
        GameTimer,
        GameState,
        EventManager
    };
}