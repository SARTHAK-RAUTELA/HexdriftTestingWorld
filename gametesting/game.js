const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =====================
// GAME CONSTANTS
// =====================
const LANES = [-120, 0, 120];
const BASE_SPEED = 5;
const MAX_SPEED = 12;

// =====================
// GAME STATE
// =====================
let timeScale = 1;
let speed = BASE_SPEED;
let score = 0;
let combo = 1;

// =====================
// PLAYER
// =====================
const player = {
  lane: 1,
  x: 0,
  y: canvas.height - 140,
  width: 40,
  height: 60,
  health: 3,
  ammo: 6,
  maxAmmo: 12,
  swordCooldown: 0,
  targeting: false,
  target: null
};

// =====================
// ENEMIES
// =====================
const enemies = [];

function spawnEnemy() {
  const typeRand = Math.random();
  let type = "charger";
  if (typeRand > 0.7) type = "weaver";

  enemies.push({
    type,
    lane: Math.floor(Math.random() * 3),
    z: 1000,
    xOffset: 0,
    alive: true
  });
}

setInterval(spawnEnemy, 2000);

// =====================
// INPUT
// =====================
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

window.addEventListener("mousedown", e => {
  if (player.targeting && player.target) {
    killEnemy(player.target, true);
    exitTargeting();
  }
});

// =====================
// TARGETING MODE
// =====================
function enterTargeting() {
  if (player.ammo <= 0 || player.targeting) return;

  const valid = enemies.filter(e => e.z > 0 && e.alive);
  if (!valid.length) return;

  player.target = valid.sort((a, b) => a.z - b.z)[0];
  player.targeting = true;
  timeScale = 0.3;
}

function exitTargeting() {
  player.targeting = false;
  player.target = null;
  timeScale = 1;
}

// =====================
// COMBAT
// =====================
function swordAttack() {
  if (player.swordCooldown > 0) return;

  enemies.forEach(e => {
    if (e.alive && e.z < 120 && e.lane === player.lane) {
      killEnemy(e, false);
    }
  });

  player.swordCooldown = 15;
}

function killEnemy(enemy, gun) {
  enemy.alive = false;
  score += gun ? 150 * combo : 100 * combo;
  combo += 0.1;
  if (gun) player.ammo--;
}

// =====================
// UPDATE LOOP
// =====================
function update() {
  // Speed scaling
  speed = Math.min(MAX_SPEED, speed + 0.0005);

  // Movement
  if (keys["a"] || keys["ArrowLeft"]) player.lane = Math.max(0, player.lane - 1);
  if (keys["d"] || keys["ArrowRight"]) player.lane = Math.min(2, player.lane + 1);

  // Sword
  if (keys[" "] && !player.targeting) swordAttack();

  // Gun
  if ((keys["e"] || keys["MouseRight"]) && !player.targeting) enterTargeting();
  if (keys["Escape"]) exitTargeting();

  // Cooldowns
  if (player.swordCooldown > 0) player.swordCooldown--;

  // Ammo regen
  if (!player.targeting && player.ammo < player.maxAmmo) {
    player.ammo += 0.002;
  }

  // Enemies
  enemies.forEach(e => {
    if (!e.alive) return;

    e.z -= speed * timeScale;

    if (e.type === "weaver") {
      e.xOffset = Math.sin(Date.now() / 200) * 40;
    }

    if (e.z < 0) {
      e.alive = false;
      score += 25;
      combo = 1;
    }
  });
}

// =====================
// RENDER
// =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#553311";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  // Player
  const px = canvas.width / 2 + LANES[player.lane];
  ctx.fillStyle = "#00ffff";
  ctx.fillRect(px - 20, player.y, 40, 60);

  // Enemies
  enemies.forEach(e => {
    if (!e.alive) return;
    const scale = 1 - e.z / 1000;
    const ex = canvas.width / 2 + LANES[e.lane] + e.xOffset;
    const ey = canvas.height - e.z * 0.5;

    ctx.fillStyle = "#ff4444";
    ctx.fillRect(
      ex - 20 * scale,
      ey - 40 * scale,
      40 * scale,
      60 * scale
    );

    // Target reticle
    if (player.targeting && player.target === e) {
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(ex, ey - 30 * scale, 32, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  // HUD updates
  document.getElementById("score").textContent = Math.floor(score);
  document.getElementById("ammo").textContent =
    `${Math.floor(player.ammo)} / ${player.maxAmmo}`;
  document.getElementById("combo").textContent =
    `COMBO x${combo.toFixed(1)}`;
  document.getElementById("speed").textContent =
    `SPEED ${speed.toFixed(1)}`;
}

// =====================
// GAME LOOP
// =====================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
