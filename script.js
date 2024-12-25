const startButton = document.getElementById("startButton");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let isPlaying = false;
let player = { x: 375, y: 500, width: 50, height: 50, speed: 8, health: 3 };
let bullets = [];
let enemies = [];
let powerUps = [];
let boss = null;
let score = 0;
let wave = 1;
let highScore = localStorage.getItem("highScore") || 0;
let keys = {};

// Images
const playerImage = new Image();
playerImage.src = "spaceship.png"; // Ensure this image exists

const enemyImage = new Image();
enemyImage.src = "enemy.png"; // Ensure this image exists

const backgroundImage = new Image();
backgroundImage.src = "background.png"; // Ensure this image exists

const bossImage = new Image();
bossImage.src = "boss.png"; // Ensure this image exists

// Audio files (ensure these mp3 files are in the same directory as the script)
const shootSound = new Audio("shoot.mp3"); // Ensure this sound file exists
const explosionSound = new Audio("explosion.mp3"); // Ensure this sound file exists
const powerUpSound = new Audio("powerup.mp3"); // Ensure this sound file exists
const backgroundMusic = new Audio("background.mp3");
backgroundMusic.loop = true;

// Start the game
function startGame() {
  startButton.style.display = "none";
  canvas.style.display = "block";
  isPlaying = true;
  score = 0;
  wave = 1;
  enemies = [];
  bullets = [];
  powerUps = [];
  player.health = 3;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - player.height - 20;
  backgroundMusic.play(); // Play background music
  spawnEnemies();
  spawnPowerUps();
  gameLoop();
}

// Draw player spaceship
function drawPlayer() {
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
  // Display health
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Health: " + player.health, canvas.width - 150, 30);
}

// Handle player movement
function movePlayer() {
  if (keys["w"] && player.y > 0) player.y -= player.speed; // Up
  if (keys["a"] && player.x > 0) player.x -= player.speed; // Left
  if (keys["s"] && player.y < canvas.height - player.height) player.y += player.speed; // Down
  if (keys["d"] && player.x < canvas.width - player.width) player.x += player.speed; // Right
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed; // Move bullet upwards
    ctx.fillRect(bullet.x, bullet.y, 5, 10);
    // Remove bullets off-screen
    if (bullet.y < 0) bullets.splice(index, 1);
  });
}

// Draw enemies
function drawEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed; // Move enemy downwards
    ctx.drawImage(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height);
    // End game if enemy reaches the ground
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      player.health -= 1;
      if (player.health <= 0) {
        endGame();
      }
    }

    // Remove enemy if hit by a bullet
    bullets.forEach((bullet, bulletIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + 5 > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + 10 > enemy.y
      ) {
        enemies.splice(index, 1);
        bullets.splice(bulletIndex, 1);
        explosionSound.play();
        score += 10;
      }
    });

    // Collision with the player
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      enemies.splice(index, 1);
      player.health -= 1;
      if (player.health <= 0) {
        endGame();
      }
    }
  });
}

// Draw power-ups
function drawPowerUps() {
  ctx.fillStyle = "green";
  powerUps.forEach((powerUp, index) => {
    powerUp.y += 2; // Move power-up downwards
    ctx.fillRect(powerUp.x, powerUp.y, 20, 20);
    // Remove power-up off-screen
    if (powerUp.y > canvas.height) powerUps.splice(index, 1);

    // Player collects power-up
    if (
      player.x < powerUp.x + 20 &&
      player.x + player.width > powerUp.x &&
      player.y < powerUp.y + 20 &&
      player.y + player.height > powerUp.y
    ) {
      powerUps.splice(index, 1);
      powerUpSound.play();
      // Power-up effect: Heal player
      player.health += 1;
    }
  });
}

// Spawn enemies periodically
function spawnEnemies() {
  setInterval(() => {
    if (isPlaying) {
      // Spawning enemies at a lower frequency to avoid overload
      if (enemies.length < 10) {
        enemies.push({
          x: Math.random() * (canvas.width - 50),
          y: -50,
          width: 50,
          height: 50,
          speed: Math.random() * 2 + 1,
        });
      }
    }
  }, 2000); // Spawning enemies every 2 seconds
}

// Spawn power-ups periodically
function spawnPowerUps() {
  setInterval(() => {
    if (isPlaying) {
      powerUps.push({
        x: Math.random() * (canvas.width - 20),
        y: -20,
      });
    }
  }, 10000);
}

// Draw background
function drawBackground() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Fire bullets
function fireBullet() {
  if (keys[" "] && isPlaying) {
    // Only shoot once when the spacebar is pressed
    bullets.push({
      x: player.x + player.width / 2 - 2.5,
      y: player.y,
      speed: 5,
    });
    shootSound.play();
    keys[" "] = false; // Prevent multiple bullets firing per frame
  }
}

// End game
function endGame() {
  isPlaying = false;
  backgroundMusic.pause();
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2 - 30);
  ctx.fillText("Score: " + score, canvas.width / 2 - 60, canvas.height / 2);
  ctx.fillText("High Score: " + highScore, canvas.width / 2 - 100, canvas.height / 2 + 30);
  ctx.fillText("Press R to Retry or E to Exit", canvas.width / 2 - 150, canvas.height / 2 + 60);
}

// Game loop
function gameLoop() {
  if (!isPlaying) return;

  drawBackground(); // Draw background first
  drawPlayer();
  movePlayer();
  drawBullets();
  drawEnemies();
  drawPowerUps();

  // Display score
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  fireBullet(); // Check for firing

  requestAnimationFrame(gameLoop);
}

// Event listeners
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Start the game
startButton.addEventListener("click", startGame);
