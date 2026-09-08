import { CodeProject } from '../types';

export const DEFAULT_PROJECTS: CodeProject[] = [
  {
    id: 'proj_cyber_calc',
    name: 'Neon Kinetic Calculator',
    description: 'Precision arithmetic & dynamic converter with tactile audio and reactive keys',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 1800000,
    activeFileId: 'f_calc_html',
    files: [
      {
        id: 'f_calc_html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kinetic Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-neutral-950 text-neutral-100 flex items-center justify-center min-h-screen p-4 antialiased">
  <div class="w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative overflow-hidden">
    <!-- Top Bar -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="text-xs font-mono tracking-wider text-neutral-400">JOE CODE • RUNTIME</span>
      </div>
      <button id="themeBtn" class="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-800">Rad</button>
    </div>

    <!-- Display Screen -->
    <div class="bg-black/60 rounded-2xl p-4 mb-5 border border-neutral-800/80 text-right">
      <div id="history" class="text-xs text-neutral-500 font-mono h-4 overflow-hidden"></div>
      <div id="display" class="text-3xl font-mono font-bold tracking-tight text-white mt-1 overflow-x-auto">0</div>
    </div>

    <!-- Keypad Grid -->
    <div class="grid grid-cols-4 gap-2.5">
      <button class="key action" data-val="clear">AC</button>
      <button class="key action" data-val="sign">±</button>
      <button class="key action" data-val="%">%</button>
      <button class="key op" data-val="/">÷</button>

      <button class="key num" data-val="7">7</button>
      <button class="key num" data-val="8">8</button>
      <button class="key num" data-val="9">9</button>
      <button class="key op" data-val="*">×</button>

      <button class="key num" data-val="4">4</button>
      <button class="key num" data-val="5">5</button>
      <button class="key num" data-val="6">6</button>
      <button class="key op" data-val="-">−</button>

      <button class="key num" data-val="1">1</button>
      <button class="key num" data-val="2">2</button>
      <button class="key num" data-val="3">3</button>
      <button class="key op" data-val="+">+</button>

      <button class="key num col-span-2" data-val="0">0</button>
      <button class="key num" data-val=".">.</button>
      <button class="key equals" data-val="=">=</button>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>`
      },
      {
        id: 'f_calc_js',
        name: 'app.js',
        language: 'javascript',
        content: `// Kinetic Calculator Engine
let currentInput = '0';
let previousInput = '';
let currentOp = null;
let resetNext = false;

const display = document.getElementById('display');
const historyEl = document.getElementById('history');

function updateDisplay() {
  display.textContent = currentInput;
  if (currentOp && previousInput) {
    historyEl.textContent = \`\${previousInput} \${currentOp}\`;
  } else {
    historyEl.textContent = '';
  }
}

function handleInput(val) {
  if (!isNaN(val) || val === '.') {
    if (resetNext) {
      currentInput = val === '.' ? '0.' : val;
      resetNext = false;
    } else {
      if (val === '.' && currentInput.includes('.')) return;
      currentInput = currentInput === '0' && val !== '.' ? val : currentInput + val;
    }
  } else if (['+', '-', '*', '/'].includes(val)) {
    if (currentOp && !resetNext) calculate();
    previousInput = currentInput;
    currentOp = val;
    resetNext = true;
  } else if (val === '=') {
    calculate();
    currentOp = null;
    previousInput = '';
    resetNext = true;
  } else if (val === 'clear') {
    currentInput = '0';
    previousInput = '';
    currentOp = null;
  } else if (val === 'sign') {
    currentInput = (parseFloat(currentInput) * -1).toString();
  } else if (val === '%') {
    currentInput = (parseFloat(currentInput) / 100).toString();
  }
  updateDisplay();
}

function calculate() {
  const prev = parseFloat(previousInput);
  const curr = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(curr)) return;

  let res = 0;
  switch (currentOp) {
    case '+': res = prev + curr; break;
    case '-': res = prev - curr; break;
    case '*': res = prev * curr; break;
    case '/': res = curr !== 0 ? prev / curr : 'Error'; break;
  }
  currentInput = typeof res === 'number' ? Math.round(res * 10000000) / 10000000 + '' : res;
}

document.querySelectorAll('.key').forEach(btn => {
  btn.addEventListener('click', () => {
    handleInput(btn.dataset.val);
  });
});

console.log("Kinetic Calculator initialized in Joe Code sandbox.");`
      },
      {
        id: 'f_calc_css',
        name: 'styles.css',
        language: 'css',
        content: `.key {
  height: 52px;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}
.key:active {
  transform: scale(0.96);
}
.key.num {
  background: #262626;
  color: #f5f5f5;
  border: 1px solid #333333;
}
.key.num:hover {
  background: #303030;
}
.key.action {
  background: #1f1f1f;
  color: #a3a3a3;
  border: 1px solid #2e2e2e;
}
.key.action:hover {
  background: #2a2a2a;
  color: #ffffff;
}
.key.op {
  background: #171717;
  color: #fb923c;
  border: 1px solid #2e2e2e;
  font-weight: 600;
}
.key.op:hover {
  background: #262626;
  color: #fdba74;
}
.key.equals {
  background: #ffffff;
  color: #0a0a0a;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
}
.key.equals:hover {
  background: #f0f0f0;
}`
      }
    ]
  },
  {
    id: 'proj_neon_runner',
    name: 'Cyber Orbit 2D Game',
    description: 'Fast-paced arcade canvas action with particle effects and responsive collision physics',
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000,
    activeFileId: 'f_game_html',
    files: [
      {
        id: 'f_game_html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Orbit</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    canvas { background: radial-gradient(circle, #17172a 0%, #080811 100%); }
  </style>
</head>
<body class="bg-neutral-950 text-white min-h-screen flex flex-col items-center justify-center p-4 select-none font-sans">
  <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
    <div class="w-full flex items-center justify-between mb-3">
      <div>
        <h1 class="text-lg font-bold tracking-tight">CYBER ORBIT</h1>
        <p class="text-xs text-neutral-400">Space or Tap to Jump / Dodge</p>
      </div>
      <div class="text-right">
        <span class="text-xs text-neutral-500">SCORE</span>
        <div id="scoreVal" class="text-xl font-mono font-bold text-emerald-400">0</div>
      </div>
    </div>

    <canvas id="gameCanvas" width="380" height="240" class="rounded-2xl border border-neutral-800 w-full mb-3"></canvas>

    <div class="w-full flex items-center justify-between">
      <button id="jumpBtn" class="flex-1 py-3 rounded-xl bg-white text-black font-semibold text-sm mr-2 hover:bg-neutral-200 active:scale-95 transition">
        JUMP (Space)
      </button>
      <button id="resetBtn" class="px-4 py-3 rounded-xl bg-neutral-800 text-neutral-300 font-semibold text-sm hover:bg-neutral-700 active:scale-95 transition">
        Restart
      </button>
    </div>
  </div>

  <script src="game.js"></script>
</body>
</html>`
      },
      {
        id: 'f_game_js',
        name: 'game.js',
        language: 'javascript',
        content: `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreVal');
const jumpBtn = document.getElementById('jumpBtn');
const resetBtn = document.getElementById('resetBtn');

let score = 0;
let gameOver = false;
let player = { x: 40, y: 180, vy: 0, w: 20, h: 20, grounded: true };
let obstacles = [];
let particles = [];
let frame = 0;

function resetGame() {
  score = 0;
  gameOver = false;
  player.y = 180;
  player.vy = 0;
  obstacles = [];
  particles = [];
  scoreEl.textContent = '0';
}

function jump() {
  if (player.grounded && !gameOver) {
    player.vy = -8.5;
    player.grounded = false;
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: player.x + 10,
        y: player.y + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -2,
        life: 18,
        color: '#10b981'
      });
    }
  } else if (gameOver) {
    resetGame();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    jump();
  }
});
jumpBtn.addEventListener('click', jump);
resetBtn.addEventListener('click', resetGame);

function loop() {
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Horizon / Floor
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.lineTo(canvas.width, 200);
  ctx.stroke();

  if (!gameOver) {
    // Player Physics
    player.vy += 0.42; // gravity
    player.y += player.vy;
    if (player.y >= 180) {
      player.y = 180;
      player.vy = 0;
      player.grounded = true;
    }

    // Spawn Obstacles
    if (frame % 85 === 0) {
      obstacles.push({ x: canvas.width, w: 14, h: Math.floor(Math.random() * 20) + 20 });
    }

    // Move Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= 3.5;

      // Collision Check
      if (
        player.x < obs.x + obs.w &&
        player.x + player.w > obs.x &&
        player.y + player.h > 200 - obs.h
      ) {
        gameOver = true;
      }

      if (obs.x + obs.w < 0) {
        obstacles.splice(i, 1);
        score += 10;
        scoreEl.textContent = score;
      }
    }
  }

  // Draw Player
  ctx.fillStyle = gameOver ? '#ef4444' : '#10b981';
  ctx.shadowColor = gameOver ? '#ef4444' : '#10b981';
  ctx.shadowBlur = 10;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.shadowBlur = 0;

  // Draw Obstacles
  ctx.fillStyle = '#f43f5e';
  obstacles.forEach(obs => {
    ctx.fillRect(obs.x, 200 - obs.h, obs.w, obs.h);
  });

  // Draw & Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
    if (p.life <= 0) particles.splice(i, 1);
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRASH! PRESS RESTART', canvas.width / 2, 110);
  }

  requestAnimationFrame(loop);
}

loop();
console.log("Cyber Orbit initialized in Joe Code.");`
      }
    ]
  }
];
