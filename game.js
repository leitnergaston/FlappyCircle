// --- Versión y Banner ---
const GAME_VERSION = "1.3";
const VERSION_KEY = "flappycircle_version_accepted";

function checkUpdateBanner() {
    const acceptedVersion = localStorage.getItem(VERSION_KEY);
    if (acceptedVersion !== GAME_VERSION) {
        document.getElementById('update-banner').style.display = 'block';
    }
}
document.getElementById('update-banner-accept').addEventListener('click', function () {
    localStorage.setItem(VERSION_KEY, GAME_VERSION);
    document.getElementById('update-banner').style.display = 'none';
});
window.addEventListener('DOMContentLoaded', checkUpdateBanner);


// --- Elementos del DOM ---
const gameContainer = document.getElementById('game-container');
const bird = document.getElementById('bird');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const totalElement = document.getElementById('total');
const speedIndicator = document.getElementById('speed-indicator');
const powerupIndicator = document.getElementById('active-powerups');
const startScreen = document.getElementById('start-screen');
const customizeScreen = document.getElementById('customize-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const finalCoinsElement = document.getElementById('final-coins');
const finalTotalElement = document.getElementById('final-total');
const finalSpeedElement = document.getElementById('final-speed');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const instructionsModal = document.getElementById('instructions-modal');
const instructionsBtn = document.getElementById('instructions-btn');
const instructionsEndBtn = document.getElementById('instructions-end-btn');
const closeInstructionsBtn = document.getElementById('close-instructions-btn');
const customizeBtn = document.getElementById('customize-btn');
const customizeEndBtn = document.getElementById('customize-end-btn');
const saveCustomizeBtn = document.getElementById('save-customize-btn');
const colorOptions = document.querySelectorAll('.color-option');

// --- Constantes del Juego ---
const BIRD_START_X = 100;
const BIRD_START_Y = 300;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const COIN_SIZE = 20;
const POWERUP_SIZE = 25;

// Constantes de física
const GRAVITY = 1200;
const JUMP_FORCE = -400;
const BASE_PIPE_GAP = 150;
const BASE_PIPE_FREQUENCY = 1800; // ms
const COIN_FREQUENCY = 2500; // ms
const POWERUP_FREQUENCY = 5000; // ms

// Constantes de velocidad
const BASE_PIPE_SPEED = 2;
const BASE_COIN_SPEED = 2;
const SPEED_INCREASE_INTERVAL = 10; // tuberías
const MAX_SPEED = 3;
const DELTA_MULTIPLIER = 60;

// --- MEJORA 1: Imán más rápido ---
const MAGNET_ATTRACT_SPEED_FACTOR = 10; // Original era 5

// Duración de Power-ups
const SHIELD_DURATION = 4000; // ms
const MAGNET_DURATION = 5000; // ms
const MAGNET_RADIUS = 300; // px
const TURBO_PIPES = 5;

// --- MEJORA 4: Tiempo de aviso ---
const POWERUP_WARNING_TIME = 1500; // 1.5 segundos

// Otros
const BIRD_COLLISION_TOLERANCE = 0.30; // 30%

// Dimensiones del juego
const gameWidth = gameContainer.offsetWidth;
const gameHeight = gameContainer.offsetHeight;

// --- Objeto de Estado del Juego ---
const gameState = {
    birdY: BIRD_START_Y,
    birdVelocity: 0,
    gameRunning: false,
    pipes: [],
    coins: [],
    powerups: [],
    score: 0,
    coinsCollected: 0,
    pipeGap: BASE_PIPE_GAP,
    pipeFrequency: BASE_PIPE_FREQUENCY,
    pipeFrequencyBeforeTurbo: null,
    lastPipeTime: 0,
    lastCoinTime: 0,
    lastPowerupTime: 0,
    animationId: null,
    gameSpeed: 1,
    pipeSpeed: BASE_PIPE_SPEED,
    coinSpeed: BASE_COIN_SPEED,
    pipesPassedSinceLastSpeedIncrease: 0,
    lastFrameTime: null,
    selectedColor: 'red',
    activePowerUps: {
        shield: { active: false, endTime: 0 },
        turbo: { active: false, pipesPassed: 0, targetPipes: TURBO_PIPES, originalSpeed: 1 },
        magnet: { active: false, endTime: 0 }
    }
};

// --- Inicialización ---
bird.style.left = BIRD_START_X + 'px';
bird.style.top = gameState.birdY + 'px';
bird.style.backgroundColor = gameState.selectedColor;

// --- Event Listeners ---
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
customizeBtn.addEventListener('click', showCustomizeScreen);
customizeEndBtn.addEventListener('click', showCustomizeScreen);
saveCustomizeBtn.addEventListener('click', saveCustomization);
instructionsBtn.addEventListener('click', showInstructions);
instructionsEndBtn.addEventListener('click', showInstructions);
closeInstructionsBtn.addEventListener('click', hideInstructions);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameState.gameRunning) {
        e.preventDefault();
        gameState.birdVelocity = JUMP_FORCE;
    }
});

gameContainer.addEventListener('touchstart', handleJumpEvent, { passive: false });
gameContainer.addEventListener('click', handleJumpEvent);

function handleJumpEvent(e) {
    if (!gameState.gameRunning) return;
    const target = e.target;
    if (
        target.closest('#start-btn') ||
        target.closest('#restart-btn') ||
        target.closest('#customize-btn') ||
        target.closest('#save-customize-btn') ||
        target.closest('#customize-end-btn') ||
        target.closest('#customize-screen') ||
        target.closest('#game-over') ||
        target.closest('#start-screen')
    ) {
        return;
    }
    e.preventDefault();
    gameState.birdVelocity = JUMP_FORCE;
}

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        gameState.selectedColor = option.dataset.color;
        bird.style.backgroundColor = gameState.selectedColor;
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && instructionsModal.style.display === 'flex') {
        hideInstructions();
    }
});


// --- Funciones UI (Pantallas e Instrucciones) ---

function showCustomizeScreen() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    customizeScreen.style.display = 'flex';
}

function saveCustomization() {
    customizeScreen.style.display = 'none';
    if (gameOverScreen.style.display === 'flex') {
        gameOverScreen.style.display = 'flex';
    } else {
        startScreen.style.display = 'flex';
    }
    bird.style.backgroundColor = gameState.selectedColor;
}

function showInstructions() {
    instructionsModal.style.display = 'flex';
}

function hideInstructions() {
    instructionsModal.style.display = 'none';
}


// --- Funciones Principales del Juego ---

function startGame() {
    if (gameState.gameRunning) return;

    // Resetear estado del juego
    gameState.birdY = BIRD_START_Y;
    gameState.birdVelocity = 0;
    gameState.pipes = [];
    gameState.coins = [];
    gameState.powerups = [];
    gameState.score = 0;
    gameState.coinsCollected = 0;
    gameState.lastPipeTime = 0;
    gameState.lastCoinTime = 0;
    gameState.lastPowerupTime = 0;
    gameState.gameSpeed = 1;
    gameState.pipeSpeed = BASE_PIPE_SPEED;
    gameState.coinSpeed = BASE_COIN_SPEED;
    gameState.pipeFrequency = BASE_PIPE_FREQUENCY;
    gameState.pipesPassedSinceLastSpeedIncrease = 0;
    gameState.lastFrameTime = null;

    gameState.activePowerUps = {
        shield: { active: false, endTime: 0 },
        turbo: { active: false, pipesPassed: 0, targetPipes: TURBO_PIPES, originalSpeed: 1 },
        magnet: { active: false, endTime: 0 }
    };
    updatePowerupIndicator();
    bird.className = '';
    bird.style.top = gameState.birdY + 'px';


    // Limpiar elementos del DOM
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    document.querySelectorAll('.coin').forEach(coin => coin.remove());
    document.querySelectorAll('.power-up').forEach(pu => pu.remove());

    // Actualizar UI
    scoreElement.textContent = '0';
    coinsElement.textContent = '0';
    totalElement.textContent = '0';
    speedIndicator.textContent = 'Velocidad: 1x';
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    customizeScreen.style.display = 'none';

    gameState.gameRunning = true;
    gameLoop(performance.now());
}

function restartGame() {
    gameState.gameRunning = false;
    cancelAnimationFrame(gameState.animationId);
    gameOverScreen.style.display = 'none';
    startGame();
}

function gameOver() {
    gameState.gameRunning = false;
    finalScoreElement.textContent = gameState.score;
    finalCoinsElement.textContent = gameState.coinsCollected;
    finalTotalElement.textContent = gameState.score + (gameState.coinsCollected * 2);
    finalSpeedElement.textContent = gameState.gameSpeed.toFixed(1) + 'x';
    gameOverScreen.style.display = 'flex';
    bird.className = '';
}

function increaseSpeed() {
    if (gameState.gameSpeed >= MAX_SPEED) return;

    gameState.gameSpeed += 0.2;
    gameState.pipeSpeed = BASE_PIPE_SPEED * gameState.gameSpeed;
    gameState.coinSpeed = BASE_COIN_SPEED * gameState.gameSpeed;
    gameState.pipeFrequency = BASE_PIPE_FREQUENCY / gameState.gameSpeed;
    gameState.pipesPassedSinceLastSpeedIncrease = 0;

    speedIndicator.textContent = 'Velocidad: ' + gameState.gameSpeed.toFixed(1) + 'x';
}

// --- Bucle Principal (Game Loop) ---

function gameLoop(timestamp) {
    if (!gameState.gameRunning) return;

    if (!gameState.lastFrameTime) gameState.lastFrameTime = timestamp;
    let delta = (timestamp - gameState.lastFrameTime) / 1000;
    if (isNaN(delta) || !isFinite(delta) || delta <= 0 || delta > 0.5) delta = 1 / 60;
    gameState.lastFrameTime = timestamp;

    gameState.animationId = requestAnimationFrame(gameLoop);

    // Mover el pájaro (Física)
    gameState.birdVelocity += GRAVITY * delta;
    gameState.birdY += gameState.birdVelocity * delta;
    bird.style.top = gameState.birdY + 'px';


    // Colisiones con bordes
    if (gameState.birdY < 0) {
        gameState.birdY = 0;
        gameState.birdVelocity = 0;
    } else if (gameState.birdY + BIRD_SIZE > gameHeight) {
        gameState.birdY = gameHeight - BIRD_SIZE;
        if (gameState.birdVelocity > 0 && !gameState.activePowerUps.shield.active && !gameState.activePowerUps.turbo.active) {
            gameOver();
            return;
        }
    }

    // --- Generación de Entidades ---
    if (timestamp - gameState.lastPipeTime > gameState.pipeFrequency) {
        createPipe();
        gameState.lastPipeTime = timestamp;
    }
    if (timestamp - gameState.lastCoinTime > COIN_FREQUENCY) {
        createCoin();
        gameState.lastCoinTime = timestamp;
    }
    if (timestamp - gameState.lastPowerupTime > POWERUP_FREQUENCY && Math.random() < 0.3) {
        createPowerUp();
        gameState.lastPowerupTime = timestamp;
    }

    // --- Movimiento y Colisiones ---

    // *** MEJORA 2: Delay del Turbo (Orden invertido) ***
    // 1. Chequear colisión (mientras el turbo AÚN está activo)
    if (!gameState.activePowerUps.shield.active && !gameState.activePowerUps.turbo.active) {
        checkPipeCollision();
    }
    // 2. Mover tuberías (aquí el turbo puede desactivarse DESPUÉS de pasar)
    movePipes(delta);
    // *** FIN DEL CAMBIO ***

    moveCoins(delta);
    checkCoinCollision();
    attractCoinsWithMagnet(delta);

    movePowerups(delta);
    checkPowerupCollision();

    // --- MEJORA 4: Chequeo de Power-ups (parpadeo) ---
    checkActivePowerUps();
}


// --- Funciones de Tuberías ---

function createPipe() {
    const pipeHeight = Math.floor(Math.random() * (gameHeight - gameState.pipeGap - 100)) + 50;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.left = gameWidth + 'px';
    topPipe.style.top = '0px';
    topPipe.style.height = pipeHeight + 'px';
    gameContainer.appendChild(topPipe);

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.left = gameWidth + 'px';
    bottomPipe.style.top = (pipeHeight + gameState.pipeGap) + 'px';
    bottomPipe.style.height = (gameHeight - pipeHeight - gameState.pipeGap) + 'px';
    gameContainer.appendChild(bottomPipe);

    gameState.pipes.push({
        top: topPipe,
        bottom: bottomPipe,
        x: gameWidth,
        height: pipeHeight,
        passed: false
    });
}

function movePipes(delta) {
    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        const pipe = gameState.pipes[i];
        pipe.x -= gameState.pipeSpeed * delta * DELTA_MULTIPLIER;
        pipe.top.style.left = pipe.x + 'px';
        pipe.bottom.style.left = pipe.x + 'px';

        if (!pipe.passed && pipe.x < BIRD_START_X - BIRD_SIZE) {
            pipe.passed = true;
            gameState.score++;
            gameState.pipesPassedSinceLastSpeedIncrease++;

            if (gameState.activePowerUps.turbo.active) {
                gameState.activePowerUps.turbo.pipesPassed++;
                // *** MEJORA 3: Stacking de Turbo ***
                // La desactivación ahora respeta el 'targetPipes' acumulado
                if (gameState.activePowerUps.turbo.pipesPassed >= gameState.activePowerUps.turbo.targetPipes) {
                    deactivatePowerUp('turbo');
                }
            }

            if (gameState.pipesPassedSinceLastSpeedIncrease >= SPEED_INCREASE_INTERVAL) {
                increaseSpeed();
            }

            scoreElement.textContent = gameState.score;
            totalElement.textContent = gameState.score + (gameState.coinsCollected * 2);
        }

        if (pipe.x < -PIPE_WIDTH) {
            pipe.top.remove();
            pipe.bottom.remove();
            gameState.pipes.splice(i, 1);
        }
    }
}

function checkPipeCollision() {
    const birdLeft = BIRD_START_X;
    const birdRight = BIRD_START_X + BIRD_SIZE;
    const birdTop = gameState.birdY;
    const birdBottom = gameState.birdY + BIRD_SIZE;
    const tolerance = BIRD_COLLISION_TOLERANCE;

    for (const pipe of gameState.pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        if (birdRight > pipeLeft + (PIPE_WIDTH * tolerance) &&
            birdLeft < pipeRight - (PIPE_WIDTH * tolerance)) {

            const pipeTopBottom = parseInt(pipe.top.style.height) + (BIRD_SIZE * tolerance);
            if (birdTop < pipeTopBottom - (BIRD_SIZE * tolerance)) {
                gameOver();
                return;
            }

            const pipeBottomTop = parseInt(pipe.bottom.style.top) - (BIRD_SIZE * tolerance);
            if (birdBottom > pipeBottomTop + (BIRD_SIZE * tolerance)) {
                gameOver();
                return;
            }
        }
    }
}


// --- Funciones de Monedas ---

function createCoin() {
    let suitablePipe = null;
    for (const pipe of gameState.pipes) {
        if (pipe.x > gameWidth / 2 && pipe.x < gameWidth - 100) {
            suitablePipe = pipe;
            break;
        }
    }

    let coinX, coinY;

    if (suitablePipe) {
        coinX = suitablePipe.x + (PIPE_WIDTH / 2) - (COIN_SIZE / 2); // Centrado
        const minY = suitablePipe.height + 20;
        const maxY = suitablePipe.height + gameState.pipeGap - 20;
        coinY = Math.floor(Math.random() * (maxY - minY)) + minY;
    } else {
        coinX = gameWidth;
        coinY = Math.floor(Math.random() * (gameHeight - 40)) + 20;
    }

    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = coinX + 'px';
    coin.style.top = coinY + 'px';
    gameContainer.appendChild(coin);

    gameState.coins.push({
        element: coin,
        x: coinX,
        y: coinY
    });
}

function moveCoins(delta) {
    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        coin.x -= gameState.coinSpeed * delta * DELTA_MULTIPLIER;
        coin.element.style.left = coin.x + 'px';

        if (coin.x < -COIN_SIZE) {
            coin.element.remove();
            gameState.coins.splice(i, 1);
        }
    }
}

function checkCoinCollision() {
    const birdLeft = BIRD_START_X;
    const birdRight = BIRD_START_X + BIRD_SIZE;
    const birdTop = gameState.birdY;
    const birdBottom = gameState.birdY + BIRD_SIZE;

    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        const coinLeft = coin.x;
        const coinRight = coin.x + COIN_SIZE;
        const coinTop = coin.y;
        const coinBottom = coin.y + COIN_SIZE;

        if (birdRight > coinLeft && birdLeft < coinRight &&
            birdBottom > coinTop && birdTop < coinBottom) {
            coin.element.remove();
            gameState.coins.splice(i, 1);
            gameState.coinsCollected++;
            coinsElement.textContent = gameState.coinsCollected;
            totalElement.textContent = gameState.score + (gameState.coinsCollected * 2);
        }
    }
}

function attractCoinsWithMagnet(delta) {
    if (!gameState.activePowerUps.magnet.active) return;

    const birdCenterX = BIRD_START_X + BIRD_SIZE / 2;
    const birdCenterY = gameState.birdY + BIRD_SIZE / 2;

    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        const coinCenterX = coin.x + COIN_SIZE / 2;
        const coinCenterY = coin.y + COIN_SIZE / 2;

        const dx = birdCenterX - coinCenterX;
        const dy = birdCenterY - coinCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MAGNET_RADIUS) {
            // *** MEJORA 1: Velocidad de atracción aumentada ***
            const speed = MAGNET_ATTRACT_SPEED_FACTOR * (1 - distance / MAGNET_RADIUS) * delta * DELTA_MULTIPLIER;
            coin.x += (dx / distance) * speed;
            coin.y += (dy / distance) * speed;
            coin.element.style.left = coin.x + 'px';
            coin.element.style.top = coin.y + 'px';
        }
    }
}


// --- Funciones de Power-ups ---

function getPowerUpSVG(type) {
    switch (type) {
        case 'shield':
            return `
                <svg width="25" height="25" viewBox="0 0 32 32">
                <ellipse cx="16" cy="16" rx="14" ry="14" fill="gold" stroke="#ed3a13" stroke-width="3"/>
                <path d="M16 6 Q24 10 16 28 Q8 10 16 6Z" fill="#fff59d" stroke="#ed3a13" stroke-width="2"/>
                </svg>`;
        case 'turbo':
            return `
                <svg width="25" height="25" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="orange" stroke="#d35400" stroke-width="3"/>
                <polygon points="14,7 22,15 17,15 19,25 10,15 15,15" fill="#fff" stroke="#d35400" stroke-width="1"/>
                </svg>`;
        case 'magnet':
            return `
                <svg width="25" height="25" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="lightblue" stroke="#2980b9" stroke-width="3"/>
                <path d="M10 20 Q8 12 16 12 Q24 12 22 20" fill="none" stroke="#2980b9" stroke-width="4"/>
                <rect x="8" y="18" width="4" height="6" fill="#fff"/>
                <rect x="20" y="18" width="4" height="6" fill="#fff"/>
                </svg>`;
        default:
            return `
                <svg width="25" height="25" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#ccc" stroke="#888" stroke-width="3"/>
                </svg>`;
    }
}

function createPowerUp() {
    const types = ['shield', 'turbo', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = gameWidth;
    const y = Math.floor(Math.random() * (gameHeight - 60 - POWERUP_SIZE)) + 30;

    const powerup = document.createElement('div');
    powerup.className = 'power-up';
    powerup.dataset.type = type;
    powerup.innerHTML = getPowerUpSVG(type);
    powerup.style.left = x + 'px';
    powerup.style.top = y + 'px';
    gameContainer.appendChild(powerup);

    gameState.powerups.push({
        element: powerup,
        x: x,
        y: y,
        type: type
    });
}

function movePowerups(delta) {
    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
        const pu = gameState.powerups[i];
        pu.x -= gameState.pipeSpeed * delta * DELTA_MULTIPLIER;
        pu.element.style.left = pu.x + 'px';

        if (pu.x < -POWERUP_SIZE) {
            pu.element.remove();
            gameState.powerups.splice(i, 1);
        }
    }
}

function checkPowerupCollision() {
    const birdLeft = BIRD_START_X;
    const birdRight = BIRD_START_X + BIRD_SIZE;
    const birdTop = gameState.birdY;
    const birdBottom = gameState.birdY + BIRD_SIZE;

    for (let i = gameState.powerups.length - 1; i >= 0; i--) {
        const pu = gameState.powerups[i];
        const puLeft = pu.x;
        const puRight = pu.x + POWERUP_SIZE;
        const puTop = pu.y;
        const puBottom = pu.y + POWERUP_SIZE;

        if (birdRight > puLeft && birdLeft < puRight &&
            birdBottom > puTop && birdTop < puBottom) {
            pu.element.remove();
            gameState.powerups.splice(i, 1);
            activatePowerUp(pu.type);
        }
    }
}

// *** MEJORA 3: Power-ups Acumulables (Función modificada) ***
function activatePowerUp(type) {
    const now = Date.now(); // Necesario para acumular

    switch (type) {
        case 'shield':
            // Acumula tiempo: si está activo, añade duración al final. Si no, crea uno nuevo.
            let currentShieldEnd = gameState.activePowerUps.shield.endTime;
            let newShieldEnd = (currentShieldEnd > now) ? currentShieldEnd + SHIELD_DURATION : now + SHIELD_DURATION;

            gameState.activePowerUps.shield.active = true;
            gameState.activePowerUps.shield.endTime = newShieldEnd;
            bird.classList.add('shield');
            break;

        case 'turbo':
            if (!gameState.activePowerUps.turbo.active) {
                // Primera activación: guarda velocidad original y aplica turbo
                gameState.activePowerUps.turbo.active = true;
                gameState.activePowerUps.turbo.pipesPassed = 0;
                gameState.activePowerUps.turbo.targetPipes = TURBO_PIPES; // Set inicial
                gameState.activePowerUps.turbo.originalSpeed = gameState.gameSpeed;
                gameState.pipeFrequencyBeforeTurbo = gameState.pipeFrequency;

                gameState.gameSpeed = Math.min(gameState.gameSpeed * 2, MAX_SPEED * 1.5);
                gameState.pipeSpeed = BASE_PIPE_SPEED * gameState.gameSpeed;
                gameState.coinSpeed = BASE_COIN_SPEED * gameState.gameSpeed;
                bird.classList.add('turbo');
            } else {
                // Ya está activo: solo acumula más tuberías al contador
                gameState.activePowerUps.turbo.targetPipes += TURBO_PIPES;
            }
            break;

        case 'magnet':
            // Acumula tiempo: igual que el escudo
            let currentMagnetEnd = gameState.activePowerUps.magnet.endTime;
            let newMagnetEnd = (currentMagnetEnd > now) ? currentMagnetEnd + MAGNET_DURATION : now + MAGNET_DURATION;

            gameState.activePowerUps.magnet.active = true;
            gameState.activePowerUps.magnet.endTime = newMagnetEnd;
            bird.classList.add('magnet');
            break;
    }
    updatePowerupIndicator();
}

function deactivatePowerUp(type) {
    switch (type) {
        case 'shield':
            gameState.activePowerUps.shield.active = false;
            bird.classList.remove('shield');
            break;

        case 'turbo':
            gameState.activePowerUps.turbo.active = false;
            gameState.gameSpeed = gameState.activePowerUps.turbo.originalSpeed;
            gameState.pipeSpeed = BASE_PIPE_SPEED * gameState.gameSpeed;
            gameState.coinSpeed = BASE_COIN_SPEED * gameState.gameSpeed;
            if (gameState.pipeFrequencyBeforeTurbo !== null) {
                gameState.pipeFrequency = gameState.pipeFrequencyBeforeTurbo;
                gameState.pipeFrequencyBeforeTurbo = null;
            }
            bird.classList.remove('turbo');
            break;

        case 'magnet':
            gameState.activePowerUps.magnet.active = false;
            bird.classList.remove('magnet');
            break;
    }
    // NOTA: La clase 'flashing' se elimina en checkActivePowerUps
    updatePowerupIndicator();
}

// *** MEJORA 4: Aviso de Parpadeo (Función modificada) ***
function checkActivePowerUps() {
    const now = Date.now();
    let isFlashing = false; // Flag para controlar el parpadeo
    const { shield, turbo, magnet } = gameState.activePowerUps;

    // Verificar Escudo
    if (shield.active) {
        const timeLeft = shield.endTime - now;
        if (timeLeft <= 0) {
            deactivatePowerUp('shield');
        } else if (timeLeft <= POWERUP_WARNING_TIME) {
            isFlashing = true; // Marcar para parpadear
        }
    }

    // Verificar Imán
    if (magnet.active) {
        const timeLeft = magnet.endTime - now;
        if (timeLeft <= 0) {
            deactivatePowerUp('magnet');
        } else if (timeLeft <= POWERUP_WARNING_TIME) {
            isFlashing = true; // Marcar para parpadear
        }
    }

    // Verificar Turbo
    if (turbo.active) {
        // El turbo se desactiva en movePipes
        // Aquí solo chequeamos si debe parpadear
        const pipesLeft = turbo.targetPipes - turbo.pipesPassed;
        if (pipesLeft <= 1) { // Advertir cuando queda 1 tubería
            isFlashing = true;
        }
    }

    // Aplicar o quitar la clase de parpadeo
    if (isFlashing) {
        bird.classList.add('flashing');
    } else {
        bird.classList.remove('flashing');
    }

    updatePowerupIndicator();
}

function updatePowerupIndicator() {
    const active = [];
    const { shield, turbo, magnet } = gameState.activePowerUps;

    if (shield.active) {
        const timeLeft = Math.ceil((shield.endTime - Date.now()) / 1000);
        active.push(`Escudo (${timeLeft}s)`);
    }
    if (turbo.active) {
        // Mostrar el total de tuberías restantes
        const pipesLeft = turbo.targetPipes - turbo.pipesPassed;
        active.push(`Turbo (${pipesLeft}t)`);
    }
    if (magnet.active) {
        const timeLeft = Math.ceil((magnet.endTime - Date.now()) / 1000);
        active.push(`Imán (${timeLeft}s)`);
    }

    powerupIndicator.textContent = active.length ? active.join(', ') : 'Ninguno';
}