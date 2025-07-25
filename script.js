// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

// Game settings
const gridSize = 20;
const canvasSize = 400;
const gridCount = canvasSize / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;

// Initialize game
function init() {
    highScoreElement.textContent = highScore;
    generateFood();
    draw();
    setupEventListeners();
}

// Generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount)
    };
    
    // Make sure food doesn't appear on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw everything on canvas
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (subtle)
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvasSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvasSize, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head is different color
        if (index === 0) {
            ctx.fillStyle = '#4ecdc4';
        } else {
            ctx.fillStyle = '#45b7aa';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Add some shine to the snake
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(
            segment.x * gridSize + 2,
            segment.y * gridSize + 2,
            gridSize - 8,
            gridSize / 3
        );
    });
    
    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(
        food.x * gridSize + 1,
        food.y * gridSize + 1,
        gridSize - 2,
        gridSize - 2
    );
    
    // Add shine to food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(
        food.x * gridSize + 3,
        food.y * gridSize + 3,
        gridSize - 10,
        gridSize / 3
    );
}

// Update game state
function update() {
    if (!gameRunning || gamePaused) return;
    
    // Move snake head
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
        
        // Add score animation
        scoreElement.classList.add('score-animation');
        setTimeout(() => {
            scoreElement.classList.remove('score-animation');
        }, 300);
    } else {
        snake.pop();
    }
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// Start game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = 'Game Running';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoop = setInterval(() => {
        update();
        draw();
    }, 150);
}

// Pause/resume game
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        pauseBtn.textContent = 'Resume';
        clearInterval(gameLoop);
    } else {
        pauseBtn.textContent = 'Pause';
        gameLoop = setInterval(() => {
            update();
            draw();
        }, 150);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
    
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
}

// Reset game
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    score = 0;
    gameRunning = false;
    gamePaused = false;
    
    scoreElement.textContent = score;
    gameOverElement.style.display = 'none';
    
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    
    clearInterval(gameLoop);
    generateFood();
    draw();
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameRunning || gamePaused) {
        if (event.code === 'Space') {
            if (!gameRunning) {
                startGame();
            } else {
                togglePause();
            }
        }
        return;
    }
    
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction.y === 0) {
                direction = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction.y === 0) {
                direction = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction.x === 0) {
                direction = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction.x === 0) {
                direction = { x: 1, y: 0 };
            }
            break;
        case 'Space':
            togglePause();
            break;
    }
    
    event.preventDefault();
}

// Handle mobile controls
function handleMobileControl(dir) {
    if (!gameRunning || gamePaused) return;
    
    switch (dir) {
        case 'up':
            if (direction.y === 0) {
                direction = { x: 0, y: -1 };
            }
            break;
        case 'down':
            if (direction.y === 0) {
                direction = { x: 0, y: 1 };
            }
            break;
        case 'left':
            if (direction.x === 0) {
                direction = { x: -1, y: 0 };
            }
            break;
        case 'right':
            if (direction.x === 0) {
                direction = { x: 1, y: 0 };
            }
            break;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Button controls
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', resetGame);
    
    // Mobile controls
    const controlBtns = document.querySelectorAll('.control-btn');
    controlBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            handleMobileControl(btn.dataset.direction);
        });
        
        // Prevent default touch behavior
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleMobileControl(btn.dataset.direction);
        });
    });
    
    // Prevent scrolling when using arrow keys
    document.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
    });
    
    // Touch controls for canvas (swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    });
    
    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning || gamePaused) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0 && direction.x === 0) {
                    direction = { x: 1, y: 0 }; // Right
                } else if (deltaX < 0 && direction.x === 0) {
                    direction = { x: -1, y: 0 }; // Left
                }
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0 && direction.y === 0) {
                    direction = { x: 0, y: 1 }; // Down
                } else if (deltaY < 0 && direction.y === 0) {
                    direction = { x: 0, y: -1 }; // Up
                }
            }
        }
        
        e.preventDefault();
    });
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);