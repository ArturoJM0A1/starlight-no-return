export function initGame(canvas, options = {}) {
  const { shellRef, onModeChange, musicManager } = options;
  const ctx = canvas.getContext("2d");
  const shell = shellRef ? shellRef.current : document.querySelector(".game-shell");

  function $(id) { return document.getElementById(id); }

  const TAU = Math.PI * 20;
  const PHASES = [
    {
      name: "Calma",
      duration: 3.5,
      spawn: 0.2,
      speed: 1.35,
      crystals: 0.97,
      color: "#4ee7d5",
      toast: "Calma: carga el pulso y estudia las sombras",
    },
    {
      name: "Ascenso",
      duration: 9,
      spawn: 0.13,
      speed: 1.65,
      crystals: 0.88,
      color: "#ffd166",
      toast: "Ascenso: las formas empiezan a cambiar",
    },
    {
      name: "Tormenta",
      duration: 17,
      spawn: 0.07,
      speed: 2.0,
      crystals: 0.70,
      color: "#ee597c",
      toast: "Tormenta magnetica: usa el pulso con criterio",
    },
    {
      name: "Respiro",
      duration: 4.5,
      spawn: 0.22,
      speed: 1.26,
      crystals: 1.00,
      color: "#8cffb2",
      toast: "Respiro: reposicionate y recoge cristales",
    },
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastFrame = 0;
  let obstacleId = 0;
  let magnetId = 0;
  let audioCtx = null;
  let muted = false;

  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    pointer: false,
    pointerX: 0,
    pointerY: 0,
    lastTap: 0,
  };

  let zeroTapTime = 0;

  const state = {
    mode: "welcome",
    paused: false,
    time: 0,
    distance: 0,
    score: 0,
    combo: 0,
    best: Number(localStorage.getItem("cohete-metamorfico-best") || 0),
    health: 6,
    phaseIndex: 0,
    phaseTime: 0,
    spawnTimer: 0.8,
    crystalTimer: 2.2,
    shake: 0,
    flash: 0,
    obstacles: [],
    projectiles: [],
    pickups: [],
    particles: [],
    ripples: [],
    floating: [],
    stars: [],
    ally: null,
    // Nuevos estados para power-ups
    whirlpoolTimer: 0,
    whirlpoolRemaining: 0,
    whirlpoolAbsorbCooldown: 0,
    frozenTimer: 0,
    lightningFX: [],
    bonusTimer: 120,
  };

  const player = {
    x: 150,
    y: 240,
    r: 14,
    vx: 0,
    vy: 0,
    energy: 5,
    maxEnergy: 5,
    ammo: 30,
    maxAmmo: 30,
    dashCooldown: 0,
    dashTimer: 0,
    pulseCooldown: 0,
    shotCooldown: 0,
    invuln: 0,
    invisible: false,
    invisibleTimer: 0,
    flame: 0,
    tilt: 0,
    lastDashVector: { x: 1, y: 0 },
    lightningCharges: 4,
    arrowRain: 5,
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function normalize(x, y) {
    const len = Math.hypot(x, y);
    if (len < 0.001) return { x: 1, y: 0 };
    return { x: x / len, y: y / len };
  }

  function currentPhase() {
    return PHASES[state.phaseIndex % PHASES.length];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!state.stars.length) buildStars();
    player.x = clamp(player.x || 150, 64, width - 72);
    player.y = clamp(player.y || height / 2, 78, height - 64);
  }

  function buildStars() {
    state.stars = [];
    const total = Math.round(clamp((width * height) / 8200, 64, 180));
    const palette = ["#ffffff", "#8cffb2", "#ffd166", "#b8f4ff", "#ff9db5"];
    for (let i = 0; i < total; i += 1) {
      state.stars.push({
        x: Math.random() * Math.max(width, 1),
        y: Math.random() * Math.max(height, 1),
        s: rand(0.7, 2.4),
        speed: rand(0.05, 0.45),
        twinkle: rand(0, TAU),
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
  }

  function resetGame() {
    obstacleId = 0;
    magnetId = 0;
    Object.assign(state, {
      mode: "playing",
      paused: false,
      time: 0,
      distance: 0,
      score: 0,
      combo: 0,
      health: 6,
      phaseIndex: 0,
      phaseTime: 0,
      spawnTimer: 0.6,
      crystalTimer: 1.6,
      shake: 0,
      flash: 0,
      obstacles: [],
      projectiles: [],
      pickups: [],
      particles: [],
      ripples: [],
      floating: [],
      ally: null,
      whirlpoolTimer: 0,
      whirlpoolRemaining: 0,
      whirlpoolAbsorbCooldown: 0,
      frozenTimer: 0,
      lightningFX: [],
      bonusTimer: 120,
    });
    Object.assign(player, {
      x: clamp(width * 0.22, 90, 190),
      y: height * 0.52,
      vx: 0,
      vy: 0,
      energy: 5,
      ammo: 30,
      dashCooldown: 0,
      dashTimer: 0,
      pulseCooldown: 0,
      shotCooldown: 0,
      invuln: 1.2,
      invisible: false,
      invisibleTimer: 0,
      flame: 0,
      tilt: 0,
      lastDashVector: { x: 1, y: 0 },
      lightningCharges: 4,
      arrowRain: 5,
    });
    showPhaseToast(currentPhase().toast);
    updateHud();
  }

  function startGame() {
    ensureAudio();
    resetGame();
    if (musicManager) {
      if (audioCtx) musicManager.setContext(audioCtx);
      musicManager.startMusic();
      musicManager.setIntensity(Math.min(0.15 + state.phaseIndex * 0.15, 1));
    }
    // Bonus inicial de 10000
    state.pickups.push({
      x: width - 120,
      y: height * 0.5,
      baseY: height * 0.5,
      vx: 0,
      r: 24,
      phase: 0,
      spin: 0,
      type: "bonus10000",
    });
    if (onModeChange) onModeChange("playing");
    const hud = $("hud");
    const muteButton = $("muteButton");
    const touchControls = $("touchControls");
    if (hud) hud.classList.remove("hidden");
    if (muteButton) muteButton.classList.remove("hidden");
    if (touchControls) touchControls.classList.remove("hidden");
    if (shell) shell.classList.remove("paused");
    sfx("start");
  }

  function returnHome() {
    state.mode = "welcome";
    state.paused = false;
    if (musicManager) musicManager.stopMusic();
    if (onModeChange) onModeChange("welcome");
    const hud = $("hud");
    const muteButton = $("muteButton");
    const touchControls = $("touchControls");
    if (hud) hud.classList.add("hidden");
    if (muteButton) muteButton.classList.add("hidden");
    if (touchControls) touchControls.classList.add("hidden");
    if (shell) shell.classList.remove("paused");
  }

  function showGameOver() {
    state.mode = "gameover";
    state.paused = false;
    if (musicManager) musicManager.stopMusic();
    if (shell) shell.classList.remove("paused");
    const hud = $("hud");
    const touchControls = $("touchControls");
    if (hud) hud.classList.add("hidden");
    if (touchControls) touchControls.classList.add("hidden");
    state.best = Math.max(state.best, Math.round(state.score));
    localStorage.setItem("cohete-metamorfico-best", String(state.best));
    if (onModeChange) onModeChange("gameover", {
      score: Math.round(state.score),
      best: Math.round(state.best),
      distance: Math.round(state.distance),
    });
    sfx("fail");
  }

  function togglePause() {
    if (state.mode !== "playing") return;
    state.paused = !state.paused;
    if (shell) shell.classList.toggle("paused", state.paused);
    sfx("click");
  }

  function toggleMute() {
    muted = !muted;
    const muteButton = $("muteButton");
    const muteButtonIntro = $("muteButtonIntro");
    if (muteButton) muteButton.textContent = muted ? "×" : "♪";
    if (muteButtonIntro) {
      muteButtonIntro.setAttribute("aria-pressed", String(muted));
      muteButtonIntro.textContent = muted ? "Silenciado" : "Sonido";
    }
  }

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function sfx(type) {
    if (muted || !audioCtx) return;
    const now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.connect(audioCtx.destination);
    master.gain.setValueAtTime(0.0001, now);

    const makeOsc = (freq, wave, gain, duration, detune = 0) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(g);
      g.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.04);
      return osc;
    };

    const configs = {
      start: () => {
        master.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
        makeOsc(220, "sine", 0.16, 0.24);
        const up = makeOsc(440, "triangle", 0.09, 0.42);
        up.frequency.exponentialRampToValueAtTime(760, now + 0.42);
      },
      dash: () => {
        master.gain.exponentialRampToValueAtTime(0.19, now + 0.012);
        const osc = makeOsc(680, "sawtooth", 0.1, 0.16);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);
        makeOsc(1180, "triangle", 0.05, 0.08);
      },
      pulse: () => {
        master.gain.exponentialRampToValueAtTime(0.23, now + 0.012);
        makeOsc(110, "sine", 0.16, 0.36);
        const osc = makeOsc(520, "triangle", 0.12, 0.24);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.24);
      },
      shoot: () => {
        master.gain.exponentialRampToValueAtTime(0.14, now + 0.008);
        const osc = makeOsc(760, "square", 0.08, 0.08);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.08);
        makeOsc(1540, "triangle", 0.04, 0.05);
      },
      collect: () => {
        master.gain.exponentialRampToValueAtTime(0.18, now + 0.012);
        makeOsc(880, "sine", 0.12, 0.12);
        makeOsc(1320, "triangle", 0.07, 0.2, 7);
      },
      hit: () => {
        master.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
        const osc = makeOsc(150, "sawtooth", 0.16, 0.26);
        osc.frequency.exponentialRampToValueAtTime(58, now + 0.26);
      },
      fail: () => {
        master.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
        const osc = makeOsc(180, "sawtooth", 0.12, 0.6);
        osc.frequency.exponentialRampToValueAtTime(52, now + 0.6);
      },
      click: () => {
        master.gain.exponentialRampToValueAtTime(0.09, now + 0.006);
        makeOsc(1040, "square", 0.06, 0.035);
      },
      perfect: () => {
        master.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
        makeOsc(740, "sine", 0.08, 0.1);
        makeOsc(1110, "sine", 0.08, 0.18);
      },
      empty: () => {
        master.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
        makeOsc(125, "triangle", 0.08, 0.14);
      },
      whirlpool: () => {
        master.gain.exponentialRampToValueAtTime(0.25, now + 0.012);
        makeOsc(55, "sine", 0.2, 0.5);
        makeOsc(110, "triangle", 0.15, 0.4);
      },
      ice: () => {
        master.gain.exponentialRampToValueAtTime(0.22, now + 0.012);
        makeOsc(660, "sine", 0.12, 0.28);
        makeOsc(1320, "triangle", 0.1, 0.2);
      },
      lightning: () => {
        master.gain.exponentialRampToValueAtTime(0.28, now + 0.008);
        const osc = makeOsc(1200, "sawtooth", 0.14, 0.32);
        osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.32);
        makeOsc(2400, "square", 0.08, 0.12);
        makeOsc(80, "sine", 0.18, 0.28);
      },
    };

    (configs[type] || configs.click)();
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function updateHud() {
    const scoreValue = $("scoreValue");
    const phaseValue = $("phaseValue");
    const healthValue = $("healthValue");
    const ammoValue = $("ammoValue");
    const energyDots = $("energyDots");
    if (!scoreValue) return;
    scoreValue.textContent = Math.round(state.score).toLocaleString("es-MX");
    phaseValue.textContent = currentPhase().name;
    phaseValue.style.color = currentPhase().color;
    healthValue.textContent = state.health;
    ammoValue.textContent = player.ammo;
    energyDots.innerHTML = "";
    for (let i = 0; i < player.maxEnergy; i += 1) {
      const dot = document.createElement("span");
      dot.className = `energy-dot${i < player.energy ? " full" : ""}`;
      energyDots.appendChild(dot);
    }
    const invisibleIndicator = document.getElementById("invisibleIndicator");
    if (invisibleIndicator) {
      if (player.invisible && player.invisibleTimer > 0) {
        invisibleIndicator.textContent = `✨ ${Math.ceil(player.invisibleTimer)}s`;
        invisibleIndicator.classList.remove("hidden");
      } else {
        invisibleIndicator.classList.add("hidden");
      }
    }
    const allyIndicator = document.getElementById("allyIndicator");
    if (allyIndicator) {
      if (state.ally && state.ally.timer > 0) {
        allyIndicator.textContent = `🚀 ${Math.ceil(state.ally.timer)}s`;
        allyIndicator.classList.remove("hidden");
      } else {
        allyIndicator.classList.add("hidden");
      }
    }
    // Nuevos indicadores
    const whirlpoolIndicator = document.getElementById("whirlpoolIndicator");
    if (whirlpoolIndicator) {
      if (state.whirlpoolTimer > 0) {
        whirlpoolIndicator.textContent = `🌀 ${Math.ceil(state.whirlpoolTimer)}s (${state.whirlpoolRemaining})`;
        whirlpoolIndicator.classList.remove("hidden");
      } else {
        whirlpoolIndicator.classList.add("hidden");
      }
    }
    const frozenIndicator = document.getElementById("frozenIndicator");
    if (frozenIndicator) {
      if (state.frozenTimer > 0) {
        frozenIndicator.textContent = `❄️ ${Math.ceil(state.frozenTimer)}s`;
        frozenIndicator.classList.remove("hidden");
      } else {
        frozenIndicator.classList.add("hidden");
      }
    }
    const lightningIndicator = document.getElementById("lightningIndicator");
    if (lightningIndicator) {
      if (player.lightningCharges > 0) {
        lightningIndicator.innerHTML = `<span>⚡ RAYO</span><strong>${player.lightningCharges}</strong>`;
        lightningIndicator.classList.remove("hidden");
      } else {
        lightningIndicator.classList.add("hidden");
      }
    }
    const arrowIndicator = document.getElementById("arrowIndicator");
    if (arrowIndicator) {
      if (player.arrowRain > 0) {
        arrowIndicator.innerHTML = `<span>🏹 FLECHAS</span><strong>${player.arrowRain}</strong>`;
        arrowIndicator.classList.remove("hidden");
      } else {
        arrowIndicator.classList.add("hidden");
      }
    }
  }

  function showPhaseToast(message) {
    const phaseToast = $("phaseToast");
    if (!phaseToast) return;
    phaseToast.textContent = message;
    phaseToast.classList.remove("hidden");
    clearTimeout(showPhaseToast.timer);
    showPhaseToast.timer = setTimeout(() => phaseToast.classList.add("hidden"), 1900);
  }

  function showComboToast(message) {
    const comboToast = $("comboToast");
    if (!comboToast) return;
    comboToast.textContent = message;
    comboToast.classList.remove("hidden");
    clearTimeout(showComboToast.timer);
    showComboToast.timer = setTimeout(() => comboToast.classList.add("hidden"), 900);
  }

  function addFloating(text, x, y, color = "#f8fbff") {
    state.floating.push({ text, x, y, color, life: 1, max: 1 });
  }

  function addRipple(x, y, color, radius, widthLine = 3) {
    state.ripples.push({ x, y, color, radius, widthLine, life: 0.55, max: 0.55 });
  }

  function addParticles(x, y, color, count, speed = 160, size = 4) {
    for (let i = 0; i < count; i += 1) {
      const a = rand(0, TAU);
      const v = rand(speed * 0.35, speed);
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        s: rand(size * 0.45, size),
        life: rand(0.35, 0.85),
        max: 0.85,
        color,
        rot: rand(0, TAU),
        spin: rand(-5, 5),
      });
    }
  }

  function makeObstacle(type, x, y, group = null) {
    const phase = currentPhase();
    const difficulty = 1 + state.distance / 6200;
    const baseSpeed = rand(205, 285) * phase.speed * clamp(difficulty, 1, 1.75);
    const common = {
      id: obstacleId += 1,
      type,
      x,
      y,
      baseY: y,
      vx: -baseSpeed,
      vy: 0,
      r: 32,
      angle: rand(0, TAU),
      spin: rand(-1.5, 1.5),
      phase: rand(0, TAU),
      drift: rand(0.7, 1.7),
      amp: rand(5, 28),
      seed: Math.random() * 1000,
      magnet: group,
      nearMiss: false,
      destructible: true,
      clickAt: rand(0.25, 0.7),
      pulseGlow: 0,
      stunTimer: 0,
      shockGlow: 0,
    };

    if (type === "cube") {
      common.r = rand(28, 42);
      common.amp *= 0.8;
      common.spin = rand(-2.4, 2.4);
    } else if (type === "stone") {
      common.r = rand(30, 46);
      common.amp = rand(16, 44);
      common.drift = rand(1.1, 2.4);
      common.spin = rand(-0.7, 0.7);
      common.vx *= 0.9;
    } else if (type === "ring") {
      common.r = rand(38, 58);
      common.amp = rand(4, 18);
      common.spin = rand(1.1, 2.2);
      common.vx *= 0.96;
    } else if (type === "cannibal") {
      common.r = 20;
      common.amp = 0;
      common.drift = 0;
      common.vx = rand(80, 140) * (Math.random() < 0.5 ? 1 : -1);
      common.vy = rand(-60, 60);
      common.maxSpeed = 170;
      common.angle = 0;
      common.mouth = 0;
      common.lifeSpan = 4.5;
    } else {
      common.r = rand(20, 30);
      common.amp = rand(18, 40);
      common.spin = rand(-3, 3);
      common.vx *= 1.14;
    }
    return common;
  }

  function obstacleWeight() {
    const phase = currentPhase().name;
    const base = [];
    if (phase === "Calma") base.push("cube", "cube", "stone", "ring");
    else if (phase === "Ascenso") base.push("cube", "stone", "ring", "shard", "cube");
    else if (phase === "Tormenta") base.push("cube", "stone", "ring", "shard", "ring", "stone");
    else base.push("cube", "ring", "stone");
    if (Math.random() < 0.18) return "cannibal";
    return base[Math.floor(Math.random() * base.length)];
  }

  function pickObstacleType() {
    return obstacleWeight();
  }

  function clearSpawnY() {
    const top = Math.max(100, height * 0.18);
    const bottom = height - Math.max(88, height * 0.18);
    let best = rand(top, bottom);
    let bestScore = -Infinity;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const y = rand(top, bottom);
      let score = 0;
      for (const o of state.obstacles) {
        if (o.x > width * 0.66) {
          score += Math.abs(o.y - y);
        }
      }
      score += Math.abs(y - player.y) * 0.15;
      const center = height / 2;
      const centerDist = Math.abs(y - center);
      const centerBonus = 500 * (1 - centerDist / (height / 2));
      score += centerBonus;
      if (score > bestScore) {
        bestScore = score;
        best = y;
      }
    }
    return best;
  }

  function spawnObstacle() {
    const type = pickObstacleType();
    if (type === "cannibal") {
      const side = Math.random() < 0.7 ? "right" : "left";
      const x = side === "right" ? width + rand(20, 100) : -rand(20, 100);
      const y = rand(height * 0.2, height * 0.8);
      const cannibal = makeObstacle("cannibal", x, y);
      cannibal.targetX = player.x;
      cannibal.targetY = player.y;
      state.obstacles.push(cannibal);
      return;
    }

    const x = width + rand(60, 180);
    const y = clearSpawnY();
    const phaseName = currentPhase().name;
    const shouldLink =
      phaseName === "Tormenta" || (phaseName === "Ascenso" && Math.random() < 0.34);

    if (shouldLink && Math.random() < 0.62 && type !== "cannibal") {
      const group = magnetId += 1;
      const first = makeObstacle(type, x, y, group);
      const secondType = Math.random() < 0.55 ? "stone" : pickObstacleType();
      const second = makeObstacle(
        secondType,
        x + rand(92, 170),
        clamp(y + rand(-130, 130), 110, height - 95),
        group,
      );
      second.vx *= rand(0.9, 1.05);
      state.obstacles.push(first, second);
      return;
    }

    state.obstacles.push(makeObstacle(type, x, y));
  }

  function spawnPickup() {
    const phase = currentPhase();
    if (Math.random() > phase.crystals) return;
    const y = clamp(rand(height * 0.18, height * 0.84), 92, height - 78);
    
    const r = Math.random();
    let type = "crystal";
    if (r < 0.20) type = "heart";        // 20% corazones
    else if (r < 0.23) type = "ammo";    // 3% munición
    else if (r < 0.39) type = "rainbow"; // 16% arcoíris
    else if (r < 0.50) type = "greenRocket"; // 11% cohete verde
    else if (r < 0.59) type = "whirlpool";   // 9% REMOLINO
    else if (r < 0.68) type = "ice";         // 9% HIELO
    else if (r < 0.80) type = "lightning";   // 12% RAYO
    else if (r < 0.92) type = "arrow";       // 12% flechas
    // resto 8% cristal
    
    const pickup = {
      x: width + rand(50, 140),
      y,
      baseY: y,
      vx: -rand(175, 240) * phase.speed,
      r: 18,
      phase: rand(0, TAU),
      spin: rand(-2, 2),
      type: type,
    };
    state.pickups.push(pickup);
  }

  function triggerDash() {
    if (state.mode !== "playing" || state.paused) return;
    if (player.dashCooldown > 0) {
      sfx("empty");
      return;
    }
    const vec = chooseDashVector();
    player.lastDashVector = vec;
    player.x = clamp(player.x + vec.x * 110, 54, width - 56);
    player.y = clamp(player.y + vec.y * 110, 64, height - 54);
    player.vx += vec.x * 240;
    player.vy += vec.y * 240;
    player.dashCooldown = 0.75;
    player.dashTimer = 0.18;
    state.shake = Math.max(state.shake, 4);
    addRipple(player.x, player.y, "#8cffb2", 112, 4);
    addParticles(player.x - vec.x * 30, player.y - vec.y * 30, "#8cffb2", 18, 220, 5);
    sfx("dash");
    vibrate(12);

    const danger = findDangerObstacle(170);
    if (danger && !danger.nearMiss && danger.type !== "cannibal") {
      danger.nearMiss = true;
      state.combo += 1;
      const bonus = 95 + state.combo * 20;
      state.score += bonus;
      addFloating("Esquive inteligente +" + bonus, player.x, player.y - 48, "#8cffb2");
      showComboToast(`Cadena x${state.combo}`);
      sfx("perfect");
    }
  }

  function chooseDashVector() {
    const dx = Number(input.right) - Number(input.left);
    const dy = Number(input.down) - Number(input.up);
    if (Math.hypot(dx, dy) > 0.1) return normalize(dx, dy);

    if (input.pointer) {
      const toPointer = normalize(input.pointerX - player.x, input.pointerY - player.y);
      if (Math.hypot(input.pointerX - player.x, input.pointerY - player.y) > 38) return toPointer;
    }

    const candidates = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: -0.35, y: -0.94 },
      { x: -0.35, y: 0.94 },
      { x: 0.72, y: -0.7 },
      { x: 0.72, y: 0.7 },
    ];

    let best = candidates[0];
    let bestScore = -Infinity;
    for (const raw of candidates) {
      const c = normalize(raw.x, raw.y);
      const nx = clamp(player.x + c.x * 110, 54, width - 56);
      const ny = clamp(player.y + c.y * 110, 64, height - 54);
      let score = nx * 0.12;
      score -= Math.abs(ny - height * 0.5) * 0.04;
      for (const o of state.obstacles) {
        if (o.x < player.x - 90 || o.x > player.x + 360) continue;
        const futureX = o.x + o.vx * 0.38;
        const futureY = o.y + (o.type === "cannibal" ? o.vy * 0.38 : Math.sin(o.phase + 0.4) * o.amp);
        const gap = Math.hypot(nx - futureX, ny - futureY) - (collisionRadius(o) + player.r);
        score += clamp(gap, -180, 240);
        if (gap < 24) score -= 420;
      }
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return best;
  }

  function triggerPulse() {
    if (state.mode !== "playing" || state.paused) return;
    if (player.pulseCooldown > 0 || player.energy <= 0) {
      addFloating("Sin carga", player.x, player.y - 42, "#ff9db5");
      sfx("empty");
      return;
    }

    player.energy -= 1;
    player.pulseCooldown = 0.42;
    state.shake = Math.max(state.shake, 8);
    state.flash = Math.max(state.flash, 0.18);
    addRipple(player.x, player.y, "#4ee7d5", 260, 5);
    addParticles(player.x, player.y, "#ffd166", 26, 260, 5);
    sfx("pulse");
    vibrate([18, 30, 18]);

    const affectedMagnets = new Set();
    for (const o of state.obstacles) {
      const d = dist(player, o);
      if (d < 192 && o.magnet) affectedMagnets.add(o.magnet);
    }

    let destroyed = 0;
    let pushed = 0;
    for (const o of state.obstacles) {
      const d = dist(player, o);
      const linked = o.magnet && affectedMagnets.has(o.magnet);
      if (d < 192 || linked) {
        o.dead = true;
        destroyed += 1;
        addParticles(o.x, o.y, obstacleColor(o), 18, 210, 5);
      } else if (d < 302 && o.type !== "cannibal") {
        const dir = normalize(o.x - player.x, o.y - player.y);
        o.x += dir.x * 72 + 34;
        o.baseY = clamp(o.baseY + dir.y * 70, 88, height - 76);
        o.vx *= 0.72;
        o.pulseGlow = 0.65;
        pushed += 1;
      }
    }

    if (destroyed || pushed) {
      const bonus = destroyed * 150 + pushed * 35;
      state.score += bonus;
      state.combo = destroyed ? state.combo + destroyed : state.combo;
      const word = destroyed ? "Desintegracion" : "Empuje";
      addFloating(`${word} +${bonus}`, player.x + 18, player.y - 58, "#ffd166");
      showComboToast(destroyed > 1 ? `Conexion magnetica x${destroyed}` : `Pulso preciso`);
    } else {
      addFloating("Pulso vacio", player.x + 12, player.y - 54, "#ff9db5");
    }

    updateHud();
  }

  function triggerShoot() {
    if (state.mode !== "playing" || state.paused) return;
    if (player.shotCooldown > 0) {
      sfx("empty");
      return;
    }
    if (player.ammo <= 0) {
      addFloating("Sin munición", player.x, player.y - 42, "#ff9db5");
      sfx("empty");
      return;
    }

    player.ammo--;
    player.shotCooldown = 0.25;

    let dirX = 1, dirY = 0;
    if (input.pointer) {
      const dx = input.pointerX - player.x;
      const dy = input.pointerY - player.y;
      const len = Math.hypot(dx, dy);
      if (len > 0.01) {
        dirX = dx / len;
        dirY = dy / len;
      }
    } else {
      const dx = Number(input.right) - Number(input.left);
      const dy = Number(input.down) - Number(input.up);
      if (Math.hypot(dx, dy) > 0.1) {
        dirX = dx;
        dirY = dy;
      }
    }

    state.projectiles.push({
      x: player.x + dirX * (player.r + 5),
      y: player.y + dirY * (player.r + 5),
      vx: dirX * 520,
      vy: dirY * 520,
      r: 5,
      life: 2.2,
      color: "#ffd166"
    });

    addParticles(player.x + dirX * 16, player.y + dirY * 16, "#ffd166", 5, 180, 3);
    sfx("shoot");
    updateHud();
  }

  function triggerLightning() {
    if (state.mode !== "playing" || state.paused) return;
    if (player.lightningCharges <= 0) {
      addFloating("Sin rayos", player.x, player.y - 42, "#b8f4ff");
      sfx("empty");
      return;
    }

    player.lightningCharges -= 1;
    state.shake = Math.max(state.shake, 12);
    state.flash = Math.max(state.flash, 0.25);
    sfx("lightning");
    vibrate([20, 10, 40]);

    let hitCount = 0;
    for (const o of state.obstacles) {
      if (o.dead) continue;
      if (o.x < -80 || o.x > width + 80) continue;

      const topX = rand(Math.max(o.x - 40, 40), Math.min(o.x + 40, width - 40));
      state.lightningFX.push({
        x: o.x,
        y: o.y,
        timer: 0.25,
        flashTimer: 0.12,
        topX: topX,
        topY: -10,
      });

      addParticles(o.x, o.y, "#b8f4ff", 16, 240, 5);
      addRipple(o.x, o.y, "#b8f4ff", 50, 3);

      if (o.r < 40 || o.type === "shard" || o.type === "cannibal") {
        o.dead = true;
        state.score += 120;
        addFloating("⚡ +120", o.x, o.y - 20, "#b8f4ff");
        addParticles(o.x, o.y, obstacleColor(o), 14, 200, 5);
      } else {
        o.stunTimer = 2.0;
        o.shockGlow = 0.6;
        state.score += 40;
        addFloating("⚡ Aturdido +40", o.x, o.y - 20, "#b8f4ff");
      }
      hitCount++;
    }

    if (hitCount > 0) {
      showComboToast(`⚡ Tormenta eléctrica x${hitCount}`);
    }

    updateHud();
  }

  function triggerArrowRain() {
    if (state.mode !== "playing" || state.paused) return;
    if (player.arrowRain <= 0) { sfx("empty"); return; }
    if (state.arrowRainFX) return;
    player.arrowRain -= 1;
    const cx = player.x;
    const cy = player.y - 60;
    const radius = 280;
    const count = 250 + Math.floor(Math.random() * 100);
    state.arrowRainFX = { timer: 0.5, arrows: [] };
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist2 = Math.random() * radius;
      const targetX = cx + Math.cos(angle) * dist2;
      const targetY = cy + Math.sin(angle) * dist2;
      const startY = targetY - 500 - Math.random() * 300;
      state.arrowRainFX.arrows.push({
        x: targetX + (Math.random() - 0.5) * 20,
        y: startY,
        targetX,
        targetY,
        speed: 3000 + Math.random() * 1200,
        delay: Math.random() * 0.25,
        elapsed: 0,
        done: false,
      });
    }
    sfx("lightning");
    updateHud();
  }

  function findDangerObstacle(range) {
    let best = null;
    let bestDist = Infinity;
    for (const o of state.obstacles) {
      if (o.type === "cannibal") continue;
      if (o.x < player.x - 70 || o.x > player.x + range) continue;
      const d = dist(player, o) - collisionRadius(o) - player.r;
      if (d < bestDist) {
        bestDist = d;
        best = o;
      }
    }
    return bestDist < 64 ? best : null;
  }

  function collisionRadius(o) {
    if (o.type === "ring") return o.r + 9;
    if (o.type === "shard") return o.r * 0.9;
    if (o.type === "cannibal") return o.r - 2;
    return o.r;
  }

  function collidesWithPlayer(o) {
    if (player.invisible && player.invisibleTimer > 0) return false;
    const d = dist(player, o);
    if (o.type === "ring") {
      const ringWall = Math.abs(d - o.r) < player.r + 5;
      const centerHit = d < player.r + 8;
      return ringWall || centerHit;
    }
    if (o.type === "cannibal") {
      return d < player.r + o.r - 2;
    }
    return d < player.r + collisionRadius(o);
  }

  function obstacleColor(o) {
    if (o.type === "cube") return "#9b7dff";
    if (o.type === "stone") return "#ffd166";
    if (o.type === "ring") return "#4ee7d5";
    if (o.type === "cannibal") return "#ff6666";
    return "#ff6f91";
  }

  // Nueva función para el efecto remolino (absorbe obstáculos)
  function updateWhirlpool(dt) {
    if (state.whirlpoolTimer <= 0) return;
    state.whirlpoolTimer -= dt;
    if (state.whirlpoolTimer <= 0) {
      state.whirlpoolRemaining = 0;
      addFloating("🌀 Remolino terminado", player.x, player.y - 40, "#4ee7d5");
      return;
    }
    // Cooldown entre absorciones
    if (state.whirlpoolAbsorbCooldown > 0) {
      state.whirlpoolAbsorbCooldown -= dt;
    }
    if (state.whirlpoolAbsorbCooldown <= 0 && state.whirlpoolRemaining > 0) {
      // Buscar el obstáculo más cercano dentro del radio
      let closest = null;
      let closestDist = 350; // radio de absorción
      for (const o of state.obstacles) {
        const d = dist(player, o);
        if (d < closestDist && !o.dead) {
          closestDist = d;
          closest = o;
        }
      }
      if (closest) {
        closest.dead = true;
        state.whirlpoolRemaining--;
        state.whirlpoolAbsorbCooldown = 0.12; // esperar 0.12s antes de la siguiente absorción
        addParticles(closest.x, closest.y, "#ffffff", 12, 220, 6);
        addFloating("🌀 Absorbido", closest.x, closest.y - 20, "#4ee7d5");
        sfx("whirlpool");
        // Pequeña bonificación
        state.score += 100;
        vibrate(10);
      } else {
        // No hay obstáculos cercanos, reducimos remaining a cero para no buscar en vano
        state.whirlpoolRemaining = 0;
      }
    }
    // Efecto visual de remolino alrededor del jugador
    addRipple(player.x, player.y, "#4ee7d5", 80, 3);
  }

  function updateLightningFX(dt) {
    for (const fx of state.lightningFX) {
      fx.timer -= dt;
      fx.flashTimer = Math.max(0, fx.flashTimer - dt);
    }
    state.lightningFX = state.lightningFX.filter(fx => fx.timer > 0);

    for (const o of state.obstacles) {
      if (o.stunTimer > 0) {
        o.stunTimer -= dt;
        o.shockGlow = Math.max(0, o.shockGlow - dt * 2);
        if (Math.random() < 0.3) {
          addParticles(o.x + rand(-o.r, o.r), o.y + rand(-o.r, o.r), "#b8f4ff", 2, 80, 2);
        }
      }
      if (o.shockGlow > 0 && o.stunTimer <= 0) {
        o.shockGlow = Math.max(0, o.shockGlow - dt * 2);
      }
    }
  }

  function updateAlly(dt) {
    if (!state.ally) return;
    state.ally.timer -= dt;
    if (state.ally.timer <= 0) {
      state.ally = null;
      addFloating("Aliado se fue", player.x, player.y - 50, "#8cffb2");
      return;
    }
    const dx = player.x - state.ally.x;
    const dy = player.y - state.ally.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.1) {
      const move = Math.min(240 * dt, len);
      const dirX = dx / len;
      const dirY = dy / len;
      state.ally.x += dirX * move;
      state.ally.y += dirY * move;
    }
    if (state.ally.shootCooldown > 0) {
      state.ally.shootCooldown -= dt;
    } else {
      let closest = null;
      let closestDist = 400;
      for (const o of state.obstacles) {
        const d = dist(state.ally, o);
        if (d < closestDist && d < 300) {
          closestDist = d;
          closest = o;
        }
      }
      if (closest) {
        const dir = normalize(closest.x - state.ally.x, closest.y - state.ally.y);
        state.projectiles.push({
          x: state.ally.x + dir.x * 12,
          y: state.ally.y + dir.y * 12,
          vx: dir.x * 380,
          vy: dir.y * 380,
          r: 4,
          life: 0.8,
          color: "#8cffb2"
        });
        state.ally.shootCooldown = 0.3;
        sfx("shoot");
      }
    }
  }

  function updateArrowRainFX(dt) {
    if (!state.arrowRainFX) return;
    state.arrowRainFX.timer -= dt;
    if (state.arrowRainFX.timer <= 0) {
      state.arrowRainFX = null;
      return;
    }
    for (const a of state.arrowRainFX.arrows) {
      if (a.done) continue;
      a.elapsed += dt;
      if (a.elapsed < a.delay) continue;
      a.y = a.y + a.speed * dt;
      if (a.y >= a.targetY && !a.done) {
        a.y = a.targetY;
        a.done = true;
        addParticles(a.x, a.y, "#c8a45c", 8, 120, 3);
        let closest = null;
        let closestDist = Infinity;
        for (const o of state.obstacles) {
          if (o.dead) continue;
          const d = dist(a, o) - collisionRadius(o);
          if (d < 0 && (closest === null || dist(a, o) < closestDist)) {
            closest = o;
            closestDist = dist(a, o);
          }
        }
        if (closest) {
          closest.dead = true;
          closest.shakeTimer = 0.2;
          const pts = closest.type === "cannibal" ? 100 : (closest.type === "metamorphicCube" ? 400 : (closest.type === "balanceStone" ? 500 : 120));
          state.score += pts;
          addFloating(`🏹 +${pts}`, a.x, a.y - 20, "#c8a45c");
          addParticles(closest.x, closest.y, obstacleColor(closest), 20, 200, 5);
          sfx("explosion");
        }
      }
    }
  }

  function update(dt) {
    state.time += dt;
    state.distance += dt * (78 + state.phaseIndex * 4);
    state.score += dt * (18 + state.phaseIndex * 1.6);
    state.shake = Math.max(0, state.shake - dt * 18);
    state.flash = Math.max(0, state.flash - dt);
    player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    player.pulseCooldown = Math.max(0, player.pulseCooldown - dt);
    player.dashTimer = Math.max(0, player.dashTimer - dt);
    player.invuln = Math.max(0, player.invuln - dt);
    player.shotCooldown = Math.max(0, player.shotCooldown - dt);
    
    if (player.invisible) {
      player.invisibleTimer -= dt;
      if (player.invisibleTimer <= 0) {
        player.invisible = false;
        player.invisibleTimer = 0;
        addFloating("Invisibilidad terminada", player.x, player.y - 40, "#4ee7d5");
      }
    }

    // Actualizar estado de congelación
    if (state.frozenTimer > 0) {
      state.frozenTimer -= dt;
      if (state.frozenTimer <= 0) {
        addFloating("❄️ Descongelación", player.x, player.y - 40, "#8cffb2");
      }
    }

    // Bonus de 10000 puntos (aparece como pickup, solo uno a la vez)
    state.bonusTimer -= dt;
    if (state.bonusTimer <= 0) {
      const existing = state.pickups.some((p) => p.type === "bonus10000" && !p.dead);
      if (!existing) {
        state.bonusTimer = 120;
        const bx = rand(100, width - 100);
        const by = rand(80, height - 80);
        state.pickups.push({
          x: bx,
          y: by,
          baseY: by,
          vx: 0,
          r: 24,
          phase: 0,
          spin: 0,
          type: "bonus10000",
        });
        addFloating("💰 +10000 apareció!", bx, by - 40, "#ffd700");
        addParticles(bx, by, "#ffd700", 20, 200, 5);
      }
    }

    updatePhase(dt);
    updatePlayer(dt);
    updateSpawning(dt);
    updateObstacles(dt);
    updatePickups(dt);
    updateProjectiles(dt);
    updateEffects(dt);
    updateAlly(dt);
    updateWhirlpool(dt);
    updateLightningFX(dt);
    updateArrowRainFX(dt);
    updateHud();
  }

  function updatePhase(dt) {
    state.phaseTime += dt;
    const phase = currentPhase();
    if (state.phaseTime > phase.duration) {
      state.phaseTime = 0;
      state.phaseIndex = (state.phaseIndex + 1) % PHASES.length;
      if (musicManager) {
        const idx = state.phaseIndex;
        const intensities = [0.15, 0.4, 0.8, 0.25];
        const base = intensities[idx % intensities.length];
        const cycle = Math.floor(state.phaseIndex / 4) * 0.15;
        musicManager.setIntensity(Math.min(base + cycle, 1));
      }
      showPhaseToast(currentPhase().toast);
      addRipple(width * 0.5, height * 0.5, currentPhase().color, Math.max(width, height), 2);
      sfx("click");
    }
  }

  function updatePlayer(dt) {
    const speed = player.dashTimer > 0 ? 580 : 330;
    let tx = 0;
    let ty = 0;
    if (input.pointer) {
      tx = (input.pointerX - player.x) * 6.2;
      ty = (input.pointerY - player.y) * 6.2;
    } else {
      tx = (Number(input.right) - Number(input.left)) * speed;
      ty = (Number(input.down) - Number(input.up)) * speed;
      if (tx && ty) {
        tx *= Math.SQRT1_2;
        ty *= Math.SQRT1_2;
      }
    }

    player.vx += (tx - player.vx) * Math.min(1, dt * 10);
    player.vy += (ty - player.vy) * Math.min(1, dt * 10);
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const marginX = 44;
    const top = state.mode === "playing" ? 64 : 44;
    player.x = clamp(player.x, marginX, width - marginX);
    player.y = clamp(player.y, top, height - 44);
    player.flame += dt * (player.dashTimer > 0 ? 22 : 9);
    player.tilt += ((player.vy / 520) - player.tilt) * Math.min(1, dt * 8);
  }

  function updateSpawning(dt) {
    const phase = currentPhase();
    state.spawnTimer -= dt;
    state.crystalTimer -= dt;
    const difficulty = clamp(1 - state.distance / 18000, 0.52, 1);
    if (state.spawnTimer <= 0) {
      spawnObstacle();
      state.spawnTimer = phase.spawn * difficulty * rand(0.72, 1.24);
    }
    if (state.crystalTimer <= 0) {
      spawnPickup();
      state.crystalTimer = rand(1.8, 3.2) / Math.max(phase.crystals, 0.3);
    }
  }

  function updateObstacles(dt) {
    for (const o of state.obstacles) {
      if (o.type === "cannibal") {
        if (o.lifeSpan !== undefined) {
          o.lifeSpan -= dt;
          if (o.lifeSpan <= 0) {
            o.dead = true;
            addParticles(o.x, o.y, "#ffaaaa", 12, 150, 5);
            continue;
          }
        }
        const dx = player.x - o.x;
        const dy = player.y - o.y;
        const len = Math.hypot(dx, dy);
        if (len > 0.01) {
          const dirX = dx / len;
          const dirY = dy / len;
          const accel = 180 * dt;
          o.vx += dirX * accel;
          o.vy += dirY * accel;
          const maxSpeed = o.maxSpeed || 170;
          const spd = Math.hypot(o.vx, o.vy);
          if (spd > maxSpeed) {
            o.vx = (o.vx / spd) * maxSpeed;
            o.vy = (o.vy / spd) * maxSpeed;
          }
        }
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.angle = Math.atan2(o.vy, o.vx);
        o.mouth = (state.time * 12) % (Math.PI * 2);
      } else {
        o.phase += dt * o.drift;
        o.angle += dt * o.spin;
        // Si está aturdido, no se mueve
        if (o.stunTimer > 0) {
          // No se mueve
        } else if (state.frozenTimer <= 0) {
          o.x += o.vx * dt;
          o.y = o.baseY + Math.sin(o.phase + o.seed) * o.amp;
        } else {
          o.x += o.vx * dt * 0.05;
        }
        o.pulseGlow = Math.max(0, o.pulseGlow - dt * 1.7);
        o.clickAt -= dt;
        if (o.clickAt <= 0 && o.x > -80 && o.x < width + 80 && state.mode === "playing") {
          if (o.type === "cube" || o.type === "ring") sfx("click");
          o.clickAt = rand(0.55, 1.4);
        }
      }

      if (o.type !== "cannibal") {
        if (!o.nearMiss && o.x < player.x - player.r && o.x > player.x - player.r - Math.abs(o.vx) * dt - 10) {
          const gap = dist(player, o) - collisionRadius(o) - player.r;
          if (gap > 0 && gap < 42) {
            o.nearMiss = true;
            state.combo += 1;
            const bonus = 60 + state.combo * 12;
            state.score += bonus;
            addFloating("Esquiva fina +" + bonus, player.x + 18, player.y - 42, "#8cffb2");
            showComboToast(`Cadena x${state.combo}`);
            sfx("perfect");
          }
        }
      }

      if (player.invuln <= 0 && collidesWithPlayer(o)) {
        handleHit(o);
      }
    }

    state.obstacles = state.obstacles.filter((o) => !o.dead && (o.type === "cannibal" ? (o.x > -200 && o.x < width + 200 && o.y > -200 && o.y < height + 200) : o.x > -160));
  }

  function handleHit(o) {
    o.dead = true;
    state.health -= 1;
    state.combo = 0;
    player.invuln = 1.15;
    state.shake = 15;
    state.flash = 0.42;
    addParticles(o.x, o.y, obstacleColor(o), 30, 300, 6);
    addParticles(player.x, player.y, "#ffffff", 20, 220, 4);
    addRipple(player.x, player.y, "#ff4b6e", 170, 5);
    addFloating("Impacto", player.x + 10, player.y - 52, "#ff9db5");
    sfx("hit");
    vibrate([34, 30, 44]);
    if (state.health <= 0) {
      setTimeout(showGameOver, 260);
    }
  }

  function updatePickups(dt) {
    for (const p of state.pickups) {
      p.phase += dt * 2.2;
      p.x += p.vx * dt;
      p.y = p.baseY + Math.sin(p.phase) * 18;
      if (dist(player, p) < player.r + p.r) {
        p.dead = true;
        if (p.type === "heart") {
          state.health++;
          addFloating("+ Vida", p.x, p.y - 28, "#ff6f91");
        } else if (p.type === "ammo") {
          player.ammo += 3;
          addFloating("+ Munición", p.x, p.y - 28, "#ffd166");
        } else if (p.type === "rainbow") {
          player.invisible = true;
          player.invisibleTimer = 4.0;
          player.invuln = Math.max(player.invuln, 4.0);
          addFloating("✨ ¡Invisible! ✨", p.x, p.y - 28, "#ffd166");
          addParticles(p.x, p.y, "#ff00ff", 20, 200, 5);
          sfx("collect");
        } else if (p.type === "greenRocket") {
          if (!state.ally) {
            state.ally = {
              x: player.x - 20,
              y: player.y,
              timer: 10.0,
              shootCooldown: 0,
            };
          } else {
            state.ally.timer = Math.max(state.ally.timer, 10.0);
          }
          addFloating("🚀 ¡Aliado verde! 🚀", p.x, p.y - 28, "#8cffb2");
          addParticles(p.x, p.y, "#8cffb2", 20, 200, 5);
          sfx("collect");
        } else if (p.type === "whirlpool") {
          // Activar remolino: 3 segundos, puede absorber hasta 6 obstáculos
          state.whirlpoolTimer = 4.0;
          state.whirlpoolRemaining = 12;
          state.whirlpoolAbsorbCooldown = 0;
          addFloating("🌀 ¡Remolino activado! 🌀", p.x, p.y - 28, "#4ee7d5");
          addParticles(p.x, p.y, "#4ee7d5", 24, 220, 6);
          sfx("whirlpool");
          vibrate([20, 40]);
        } else if (p.type === "ice") {
          // Congelar todos los obstáculos por 3 segundos
          state.frozenTimer = 3.0;
          addFloating("❄️ ¡Congelación masiva! ❄️", p.x, p.y - 28, "#8cffb2");
          addParticles(p.x, p.y, "#88ccff", 24, 200, 5);
          sfx("ice");
          vibrate(30);
          // Efecto visual de onda de hielo
          addRipple(p.x, p.y, "#88ccff", 180, 4);
        } else if (p.type === "lightning") {
          player.lightningCharges++;
          addFloating("⚡ ¡Rayo almacenado! ⚡", p.x, p.y - 28, "#b8f4ff");
          addParticles(p.x, p.y, "#b8f4ff", 20, 200, 5);
          sfx("collect");
          vibrate(12);
        } else if (p.type === "arrow") {
          player.arrowRain++;
          addFloating("🏹 ¡Lluvia de flechas! 🏹", p.x, p.y - 28, "#ffd166");
          addParticles(p.x, p.y, "#c8a45c", 20, 200, 5);
          sfx("collect");
          vibrate(12);
        } else if (p.type === "bonus10000") {
          state.score += 10000;
          addFloating("💰 +10000", p.x, p.y - 32, "#ffd700");
          addParticles(p.x, p.y, "#ffd700", 40, 350, 8);
          addRipple(p.x, p.y, "#ffd700", 200, 6);
          sfx("explosion");
          vibrate(50);
          state.shake = Math.max(state.shake, 8);
          state.flash = Math.max(state.flash, 0.3);
        } else {
          player.energy += 1;
          addFloating("+ Pulso", p.x, p.y - 28, "#4ee7d5");
          state.score += 45;
        }
          addParticles(p.x, p.y, p.type === "heart" ? "#ff6f91" : (p.type === "ammo" ? "#ffd166" : (p.type === "rainbow" ? "#ff00ff" : (p.type === "greenRocket" ? "#8cffb2" : (p.type === "whirlpool" ? "#4ee7d5" : (p.type === "ice" ? "#88ccff" : (p.type === "lightning" ? "#b8f4ff" : "#4ee7d5")))))), 16, 180, 4);
        sfx("collect");
        vibrate(8);
        updateHud();
      }
    }
    state.pickups = state.pickups.filter((p) => !p.dead && p.x > -80);
  }

  function updateProjectiles(dt) {
    for (let i = 0; i < state.projectiles.length; i++) {
      const p = state.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      let hit = false;
      for (let o of state.obstacles) {
        if (dist(p, o) < p.r + collisionRadius(o)) {
          hit = true;
          o.dead = true;
          addParticles(o.x, o.y, obstacleColor(o), 12, 200, 5);
          state.score += 80;
          addFloating("+80", o.x, o.y - 20, "#ffd166");
          sfx("perfect");
          break;
        }
      }
      if (hit || p.life <= 0 || p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
        state.projectiles.splice(i, 1);
        i--;
      }
    }
  }

  function updateEffects(dt) {
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - dt * 1.9;
      p.vy *= 1 - dt * 1.9;
      p.rot += p.spin * dt;
      p.life -= dt;
    }
    for (const r of state.ripples) r.life -= dt;
    for (const f of state.floating) {
      f.y -= dt * 44;
      f.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    state.ripples = state.ripples.filter((r) => r.life > 0);
    state.floating = state.floating.filter((f) => f.life > 0);
  }

  function render() {
    ctx.save();
    if (state.shake > 0) {
      ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    }
    drawBackground();

    if (state.mode !== "playing") {
      drawAttractMode();
    }

    drawMagnetConnections();
    for (const p of state.pickups) drawPickup(p);
    drawProjectiles();
    for (const o of state.obstacles) drawObstacleShadow(o);
    for (const o of state.obstacles) drawObstacle(o);
    drawLightningBolts();
    drawArrowRain();
    drawRipples();
    drawParticles();
    if (state.ally) drawAlly();
    drawPlayer();
    drawFloating();

    if (state.flash > 0) {
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(255, 111, 145, ${state.flash * 0.55})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }

    drawVignette();
    ctx.restore();
  }

  function drawBackground() {
    const t = state.time;
    const sky = ctx.createLinearGradient(0, 0, width, height);
    sky.addColorStop(0, "#071022");
    sky.addColorStop(0.38, "#201446");
    sky.addColorStop(0.68, "#06273a");
    sky.addColorStop(1, "#12091f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const nebulaA = ctx.createRadialGradient(width * 0.2, height * 0.24, 20, width * 0.2, height * 0.24, width * 0.44);
    nebulaA.addColorStop(0, "rgba(255, 111, 145, 0.2)");
    nebulaA.addColorStop(1, "rgba(255, 111, 145, 0)");
    ctx.fillStyle = nebulaA;
    ctx.fillRect(0, 0, width, height);

    const nebulaB = ctx.createRadialGradient(width * 0.78, height * 0.72, 30, width * 0.78, height * 0.72, width * 0.52);
    nebulaB.addColorStop(0, "rgba(78, 231, 213, 0.18)");
    nebulaB.addColorStop(0.55, "rgba(155, 125, 255, 0.08)");
    nebulaB.addColorStop(1, "rgba(78, 231, 213, 0)");
    ctx.fillStyle = nebulaB;
    ctx.fillRect(0, 0, width, height);

    for (const s of state.stars) {
      const x = (s.x - state.distance * s.speed) % (width + 20);
      const drawX = x < -10 ? x + width + 20 : x;
      const tw = 0.55 + Math.sin(t * 2.2 + s.twinkle) * 0.35;
      ctx.globalAlpha = clamp(tw, 0.18, 0.92);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(drawX, s.y, s.s, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const light = ctx.createRadialGradient(player.x, player.y, 8, player.x, player.y, 260);
    light.addColorStop(0, "rgba(255, 255, 255, 0.18)");
    light.addColorStop(0.2, "rgba(78, 231, 213, 0.12)");
    light.addColorStop(1, "rgba(78, 231, 213, 0)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, width, height);
  }

  function drawAttractMode() {
    const t = performance.now() / 1000;
    const centerX = width * 0.58;
    const centerY = height * 0.52;
    const samples = [
      { type: "cube", x: centerX - 110, y: centerY - 78, r: 44, angle: t, pulseGlow: 0.3, phase: t, seed: 2 },
      { type: "stone", x: centerX + 82, y: centerY - 18, r: 48, angle: -t * 0.6, pulseGlow: 0.2, phase: t, seed: 5 },
      { type: "ring", x: centerX - 5, y: centerY + 98, r: 56, angle: t * 1.2, pulseGlow: 0.35, phase: t, seed: 9 },
      { type: "cannibal", x: centerX - 40, y: centerY + 30, r: 20, angle: t * 1.5, mouth: t * 8 },
    ];
    for (const o of samples) drawObstacleShadow(o, 0.42);
    for (const o of samples) drawObstacle(o, true);
  }

  function drawMagnetConnections() {
    const groups = new Map();
    for (const o of state.obstacles) {
      if (!o.magnet) continue;
      if (!groups.has(o.magnet)) groups.set(o.magnet, []);
      groups.get(o.magnet).push(o);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      for (let i = 0; i < group.length - 1; i += 1) {
        const a = group[i];
        const b = group[i + 1];
        const nearPlayer = Math.min(dist(player, a), dist(player, b)) < 230;
        const alpha = nearPlayer ? 0.44 : 0.18;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(78, 231, 213, ${alpha})`;
        ctx.lineWidth = nearPlayer ? 2.2 : 1.2;
        ctx.setLineDash([8, 10]);
        ctx.lineDashOffset = -state.time * 34;
        ctx.beginPath();
        const cx = (a.x + b.x) / 2;
        const cy = (a.y + b.y) / 2 + Math.sin(state.time * 3 + a.seed) * 28;
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  function drawObstacleShadow(o, strength = 1) {
    if (o.type === "cannibal") return;
    const lightX = player.x - 42;
    const lightY = player.y - 120;
    const dir = normalize(o.x - lightX, o.y - lightY);
    const offset = 28 + o.r * 0.48;
    const sx = o.x + dir.x * offset;
    const sy = o.y + dir.y * offset;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(o.angle * 0.45);
    ctx.scale(1.18 + Math.abs(dir.x) * 0.35, 0.42 + Math.abs(dir.y) * 0.18);
    ctx.globalAlpha = 0.28 * strength;
    ctx.fillStyle = "#01030a";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    if (o.type === "ring") {
      ctx.ellipse(0, 0, o.r * 1.16, o.r * 0.7, 0, 0, TAU);
    } else if (o.type === "stone") {
      for (let i = 0; i < 9; i += 1) {
        const a = (i / 9) * TAU;
        const r = o.r * (0.76 + 0.22 * Math.sin(i * 1.7 + o.seed));
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      ctx.rect(-o.r, -o.r * 0.7, o.r * 2, o.r * 1.4);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawObstacle(o, forceReveal = false) {
    const reveal = forceReveal || (o.type !== "cannibal" && (dist(player, o) < 190 || o.pulseGlow > 0.01));
    ctx.save();
    ctx.translate(o.x, o.y);
    if (o.type !== "cannibal") ctx.rotate(o.angle);
    if (o.pulseGlow > 0 && o.type !== "cannibal") {
      ctx.shadowColor = "#4ee7d5";
      ctx.shadowBlur = 22 * o.pulseGlow;
    }
    // Efecto de hielo si está congelado
    const isFrozen = state.frozenTimer > 0;
    if (isFrozen && o.type !== "cannibal") {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "rgba(136, 204, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(0, 0, o.r + 2, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    if (o.shockGlow > 0 && o.type !== "cannibal") {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const shockAlpha = Math.min(1, o.shockGlow * 2);
      ctx.fillStyle = `rgba(184, 244, 255, ${shockAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, 0, o.r + 4 + Math.sin(state.time * 20) * 3, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${shockAlpha * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i * TAU / 6 + state.time * 8;
        const sr = o.r + 6 + Math.sin(state.time * 15 + i) * 4;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (o.type === "cube") drawMetamorphicCube(o, reveal, isFrozen);
    else if (o.type === "stone") drawBalanceStone(o, reveal, isFrozen);
    else if (o.type === "ring") drawInfiniteRing(o, reveal, isFrozen);
    else if (o.type === "shard") drawShard(o, reveal, isFrozen);
    else if (o.type === "cannibal") drawCannibal(o, reveal);
    ctx.restore();
  }

  function drawCannibal(o, reveal) {
    const r = o.r;
    const angle = o.angle;
    const mouthOpen = Math.sin(o.mouth) * 0.6 + 0.6;
    ctx.save();
    ctx.rotate(angle);
    const grad = ctx.createRadialGradient(-r*0.2, -r*0.2, 2, 0, 0, r);
    grad.addColorStop(0, "#ff8888");
    grad.addColorStop(1, "#dd4a4a");
    ctx.fillStyle = grad;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(255,100,100,0.5)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.25, r * 0.22, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#2c2c2c";
    ctx.beginPath();
    ctx.arc(r * 0.4, -r * 0.28, r * 0.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.33, r * 0.05, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffaaaa";
    ctx.beginPath();
    ctx.ellipse(r * 0.5, r * 0.1, r * 0.12, r * 0.08, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffaaaa";
    ctx.beginPath();
    ctx.ellipse(-r * 0.2, r * 0.15, r * 0.12, r * 0.08, 0, 0, TAU);
    ctx.fill();
    const mouthStart = mouthOpen * 0.6;
    const mouthEnd = TAU - mouthStart;
    ctx.fillStyle = "#3a1a1a";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r - 2, mouthStart, mouthEnd);
    ctx.fill();
    ctx.fillStyle = "#ff8888";
    ctx.beginPath();
    ctx.arc(0, 0, r - 5, mouthStart, mouthEnd);
    ctx.fill();
    if (mouthOpen > 0.4) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(r * 0.3, -r * 0.1);
      ctx.lineTo(r * 0.45, -r * 0.25);
      ctx.lineTo(r * 0.55, -r * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.3, r * 0.15);
      ctx.lineTo(r * 0.45, r * 0.3);
      ctx.lineTo(r * 0.55, r * 0.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.6, -r * 0.05);
      ctx.lineTo(r * 0.75, -r * 0.18);
      ctx.lineTo(r * 0.85, -r * 0.02);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(r * 0.6, r * 0.2);
      ctx.lineTo(r * 0.75, r * 0.33);
      ctx.lineTo(r * 0.85, r * 0.17);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawMetamorphicCube(o, reveal, frozen) {
    const morph = (Math.sin(o.phase * 2.1 + o.seed) + 1) / 2;
    const sides = 4 + Math.floor(morph * 4);
    const r = o.r * (0.86 + morph * 0.18);
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#f8fbff");
    grad.addColorStop(0.34, "#9b7dff");
    grad.addColorStop(0.72, "#4ee7d5");
    grad.addColorStop(1, "#ff6f91");

    ctx.beginPath();
    for (let i = 0; i < sides; i += 1) {
      const a = (i / sides) * TAU + Math.PI / 4;
      const kink = 1 + Math.sin(o.phase * 3 + i * 1.8) * 0.14;
      const x = Math.cos(a) * r * kink;
      const y = Math.sin(a) * r * kink;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.68)";
    ctx.stroke();

    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(9, 11, 34, 0.22)";
    ctx.beginPath();
    ctx.moveTo(-r * 0.12, -r * 0.9);
    ctx.lineTo(r * 0.95, -r * 0.08);
    ctx.lineTo(r * 0.16, r * 0.86);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (reveal) {
      ctx.save();
      ctx.globalAlpha = 0.74;
      ctx.strokeStyle = "rgba(255,255,255,0.72)";
      ctx.lineWidth = 1.2;
      for (let y = -r; y <= r; y += 8) {
        ctx.beginPath();
        ctx.moveTo(-r, y + Math.sin(y + o.seed) * 3);
        ctx.lineTo(r, y - 7 + Math.cos(y) * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffd166";
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.arc(Math.cos(i * 1.7) * r * 0.52, Math.sin(i * 1.4) * r * 0.44, 2.4, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawBalanceStone(o, reveal, frozen) {
    const r = o.r;
    ctx.save();
    ctx.rotate(Math.sin(o.phase * 1.7) * 0.35);
    const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.4, 4, 0, 0, r * 1.18);
    grad.addColorStop(0, "#fff1b9");
    grad.addColorStop(0.42, "#ffd166");
    grad.addColorStop(0.76, "#d77d63");
    grad.addColorStop(1, "#58334c");
    ctx.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * TAU;
      const jag = 0.78 + 0.24 * Math.sin(o.seed + i * 2.33) + 0.06 * Math.sin(o.phase * 3 + i);
      const x = Math.cos(a) * r * jag;
      const y = Math.sin(a) * r * (1.1 - jag * 0.2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.48)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.24, -r * 0.26, r * 0.2, r * 0.12, -0.5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.88, r * 0.18, r * 0.045, 0, 0, TAU);
    ctx.fill();

    if (reveal) {
      ctx.strokeStyle = "rgba(8, 18, 42, 0.46)";
      ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-r * 0.55, i * r * 0.18);
        ctx.bezierCurveTo(-r * 0.12, i * r * 0.22 - 12, r * 0.15, i * r * 0.2 + 12, r * 0.58, i * r * 0.15);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawInfiniteRing(o, reveal, frozen) {
    const r = o.r + Math.sin(o.phase * 2.4) * 5;
    const thickness = 10 + Math.sin(o.phase * 1.8) * 2;
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#4ee7d5");
    grad.addColorStop(0.5, "#f8fbff");
    grad.addColorStop(1, "#9b7dff");
    ctx.lineCap = "round";
    ctx.lineWidth = thickness;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0.25, TAU * 0.86);
    ctx.stroke();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 209, 102, 0.86)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, TAU * 0.04, TAU * 0.92);
    ctx.stroke();

    ctx.fillStyle = "#ff6f91";
    for (let i = 0; i < 3; i += 1) {
      const a = o.phase + i * TAU / 3;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 4.2, 0, TAU);
      ctx.fill();
    }

    if (reveal) {
      ctx.strokeStyle = "rgba(255,255,255,0.54)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let i = 0; i < 80; i += 1) {
        const a = i * 0.24;
        const rr = i * 0.56;
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawShard(o, reveal, frozen) {
    const r = o.r;
    const grad = ctx.createLinearGradient(-r, -r, r, r);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.36, "#ff6f91");
    grad.addColorStop(1, "#ffd166");
    ctx.beginPath();
    ctx.moveTo(r * 1.2, 0);
    ctx.lineTo(-r * 0.5, -r * 0.72);
    ctx.lineTo(-r * 0.22, -r * 0.1);
    ctx.lineTo(-r * 1.1, r * 0.62);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.56)";
    ctx.lineWidth = 2;
    ctx.stroke();
    if (reveal) {
      ctx.strokeStyle = "rgba(8,18,42,0.5)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.65, r * 0.35);
      ctx.lineTo(r * 0.78, -r * 0.05);
      ctx.stroke();
    }
  }

  function drawPickup(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.phase + p.spin);
    const r = p.r;
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowBlur = 18;
    
    if (p.type === "heart") {
      ctx.shadowColor = "#ff6f91";
      ctx.fillStyle = "#ff4b6e";
      ctx.beginPath();
      ctx.moveTo(0, -r*0.7);
      ctx.bezierCurveTo(-r*0.5, -r*1.2, -r*0.8, -r*0.3, 0, r*0.5);
      ctx.bezierCurveTo(r*0.8, -r*0.3, r*0.5, -r*1.2, 0, -r*0.7);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(-r*0.25, -r*0.2, r*0.18, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(r*0.25, -r*0.2, r*0.18, 0, TAU);
      ctx.fill();
    } else if (p.type === "ammo") {
      ctx.shadowColor = "#ffd166";
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.rect(-r*0.6, -r*0.4, r*1.2, r*0.8);
      ctx.fill();
      ctx.fillStyle = "#f8fbff";
      ctx.beginPath();
      ctx.rect(-r*0.3, -r*0.2, r*0.6, r*0.4);
      ctx.fill();
      ctx.fillStyle = "#ff6f91";
      ctx.beginPath();
      ctx.arc(r*0.5, 0, r*0.3, 0, TAU);
      ctx.fill();
    } else if (p.type === "rainbow") {
      ctx.shadowColor = "#ffffff";
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, "#ff0000");
      grad.addColorStop(0.16, "#ff8800");
      grad.addColorStop(0.33, "#ffff00");
      grad.addColorStop(0.5, "#00ff00");
      grad.addColorStop(0.66, "#0088ff");
      grad.addColorStop(0.83, "#4400ff");
      grad.addColorStop(1, "#ff00ff");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.rect(-r*0.7, -r*0.7, r*1.4, r*1.4);
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(-r*0.7, -r*0.7, r*1.4, r*1.4);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.rect(-r*0.3, -r*0.5, r*0.6, r*0.2);
      ctx.fill();
    } else if (p.type === "greenRocket") {
      ctx.shadowColor = "#8cffb2";
      ctx.fillStyle = "#6fbf4c";
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.7, -r * 0.3);
      ctx.lineTo(r * 0.4, r * 0.5);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(-r * 0.4, r * 0.5);
      ctx.lineTo(-r * 0.7, -r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f8fbff";
      ctx.beginPath();
      ctx.arc(0, -r*0.2, r*0.25, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ff6f91";
      ctx.beginPath();
      ctx.rect(-r*0.2, r*0.3, r*0.4, r*0.3);
      ctx.fill();
    } else if (p.type === "whirlpool") {
      // Remolino: espiral azul/cián
      ctx.shadowColor = "#4ee7d5";
      ctx.fillStyle = "rgba(78, 231, 213, 0.3)";
      ctx.beginPath();
      ctx.arc(0, 0, r*0.9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#4ee7d5";
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = i * Math.PI * 2 / 3 + p.phase;
        const xr = Math.cos(angle) * r * 0.6;
        const yr = Math.sin(angle) * r * 0.6;
        ctx.moveTo(0, 0);
        ctx.lineTo(xr, yr);
      }
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, r*0.4, 0, TAU);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, r*0.2, 0, TAU);
      ctx.fillStyle = "#071022";
      ctx.fill();
    } else if (p.type === "lightning") {
      ctx.shadowColor = "#b8f4ff";
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.85);
      ctx.lineTo(r * 0.25, -r * 0.15);
      ctx.lineTo(r * 0.08, -r * 0.15);
      ctx.lineTo(r * 0.35, r * 0.5);
      ctx.lineTo(-r * 0.1, r * 0.5);
      ctx.lineTo(-r * 0.3, r * 0.85);
      ctx.lineTo(-r * 0.05, r * 0.25);
      ctx.lineTo(r * 0.1, r * 0.25);
      ctx.lineTo(-r * 0.2, -r * 0.3);
      ctx.lineTo(r * 0.15, -r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-r * 0.08, -r * 0.5, r * 0.15, 0, TAU);
      ctx.fill();
    } else if (p.type === "ice") {
      // Cristal de hielo
      ctx.shadowColor = "#88ccff";
      ctx.fillStyle = "#88ccff";
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r*0.6, -r*0.3);
      ctx.lineTo(r*0.8, r*0.2);
      ctx.lineTo(r*0.3, r*0.7);
      ctx.lineTo(-r*0.3, r*0.7);
      ctx.lineTo(-r*0.8, r*0.2);
      ctx.lineTo(-r*0.6, -r*0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -r*0.6);
      ctx.lineTo(r*0.3, -r*0.2);
      ctx.lineTo(0, r*0.2);
      ctx.lineTo(-r*0.3, -r*0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#aaffff";
      ctx.beginPath();
      ctx.arc(r*0.3, r*0.2, r*0.15, 0, TAU);
      ctx.fill();
    } else if (p.type === "arrow") {
      ctx.shadowColor = "#c8a45c";
      ctx.fillStyle = "#c8a45c";
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(-r * 0.1, -r * 0.5);
      ctx.lineTo(-r * 0.1, -r * 0.15);
      ctx.lineTo(-r, -r * 0.15);
      ctx.lineTo(-r, r * 0.15);
      ctx.lineTo(-r * 0.1, r * 0.15);
      ctx.lineTo(-r * 0.1, r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f8e8b0";
      ctx.beginPath();
      ctx.rect(-r * 0.3, -r * 0.08, r * 0.5, r * 0.16);
      ctx.fill();
    } else if (p.type === "bonus10000") {
      ctx.shadowColor = "#ffd700";
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffec8a";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#b8860b";
      ctx.font = `bold ${r * 0.7}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);
    } else {
      ctx.shadowColor = "#4ee7d5";
      const grad = ctx.createLinearGradient(-r, -r, r, r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.38, "#4ee7d5");
      grad.addColorStop(1, "#9b7dff");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.75, -r * 0.12);
      ctx.lineTo(r * 0.42, r);
      ctx.lineTo(-r * 0.42, r);
      ctx.lineTo(-r * 0.75, -r * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.82)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAlly() {
    if (!state.ally) return;
    ctx.save();
    ctx.translate(state.ally.x, state.ally.y);
    ctx.rotate(state.time * 4);
    const r = 14;
    ctx.fillStyle = "#6fbf4c";
    ctx.shadowBlur = 12;
    ctx.shadowColor = "#8cffb2";
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.7, -r * 0.3);
    ctx.lineTo(r * 0.4, r * 0.5);
    ctx.lineTo(0, r * 0.8);
    ctx.lineTo(-r * 0.4, r * 0.5);
    ctx.lineTo(-r * 0.7, -r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8fbff";
    ctx.beginPath();
    ctx.arc(0, -r*0.2, r*0.25, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ff6f91";
    ctx.beginPath();
    ctx.rect(-r*0.2, r*0.3, r*0.4, r*0.3);
    ctx.fill();
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of state.projectiles) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 12;
      ctx.shadowColor = p.color === "#8cffb2" ? "#8cffb2" : "#ffd166";
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLightningBolts() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const fx of state.lightningFX) {
      const alpha = Math.max(0, fx.timer / 0.25);
      const segments = 8;
      const dx = fx.x - fx.topX;
      const dy = fx.y - fx.topY;

      ctx.strokeStyle = `rgba(184, 244, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#b8f4ff";
      ctx.beginPath();
      ctx.moveTo(fx.topX, fx.topY);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const bx = fx.topX + dx * t + (Math.random() - 0.5) * 28;
        const by = fx.topY + dy * t;
        ctx.lineTo(bx, by);
      }
      ctx.lineTo(fx.x, fx.y);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.moveTo(fx.topX, fx.topY);
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const bx = fx.topX + dx * t + (Math.random() - 0.5) * 16;
        const by = fx.topY + dy * t;
        ctx.lineTo(bx, by);
      }
      ctx.lineTo(fx.x, fx.y);
      ctx.stroke();

      if (fx.flashTimer > 0) {
        const flashAlpha = Math.min(1, fx.flashTimer * 8);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.7})`;
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#b8f4ff";
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, 14 * flashAlpha, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawArrowRain() {
    if (!state.arrowRainFX) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const a of state.arrowRainFX.arrows) {
      if (a.done) continue;
      if (a.elapsed < a.delay) continue;
      const p = Math.min(1, (a.elapsed - a.delay) / 0.5);
      const alpha = p < 0.2 ? p / 0.2 : 0.7;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#c8a45c";
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#c8a45c";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x, a.y + 24);
      ctx.stroke();
      ctx.fillStyle = "#f8e8b0";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y + 24);
      ctx.lineTo(a.x - 5, a.y + 16);
      ctx.lineTo(a.x + 5, a.y + 16);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRipples() {
    for (const r of state.ripples) {
      const p = 1 - r.life / r.max;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, r.life / r.max) * 0.78;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.widthLine * (1 - p * 0.35);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius * p, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of state.particles) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      ctx.restore();
    }
  }

  function drawFloating() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "800 16px Inter, system-ui, sans-serif";
    for (const f of state.floating) {
      ctx.globalAlpha = Math.max(0, f.life / f.max);
      ctx.fillStyle = f.color;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 8;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.restore();
  }

  function drawPlayer() {
    if (player.invisible && player.invisibleTimer > 0) {
      ctx.globalAlpha = 0.4;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowBlur = 20;
      ctx.shadowColor = "#ffffff";
    }
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.tilt);

    const inv = player.invuln > 0 && Math.sin(state.time * 32) > 0 && !player.invisible;
    if (inv) ctx.globalAlpha = 0.72;

    const flamePulse = Math.sin(player.flame) * 0.22 + 0.78;
    const flameLong = player.dashTimer > 0 ? 44 : 20;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const flame = ctx.createLinearGradient(-28 - flameLong, 0, -14, 0);
    flame.addColorStop(0, "rgba(78, 231, 213, 0)");
    flame.addColorStop(0.35, "rgba(255, 209, 102, 0.62)");
    flame.addColorStop(0.7, "rgba(255, 111, 145, 0.88)");
    flame.addColorStop(1, "rgba(255,255,255,0.96)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-20, -6);
    ctx.quadraticCurveTo(-28 - flameLong * flamePulse, 0, -20, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.shadowColor = player.dashTimer > 0 ? "#8cffb2" : "#4ee7d5";
    ctx.shadowBlur = player.dashTimer > 0 ? 20 : 10;

    const damaged = player.invuln > 0 && !player.invisible;
    const body = ctx.createLinearGradient(-18, -12, 24, 12);
    body.addColorStop(0, damaged ? "#ffcccc" : "#eaf7ff");
    body.addColorStop(0.46, damaged ? "#ff6b6b" : "#8bdcff");
    body.addColorStop(0.76, damaged ? "#ffaaaa" : "#ffffff");
    body.addColorStop(1, "#ff6f91");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.bezierCurveTo(14, -16, -12, -15, -22, -6);
    ctx.lineTo(-22, 6);
    ctx.bezierCurveTo(-12, 15, 14, 16, 24, 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = damaged ? "rgba(255,80,80,0.9)" : "rgba(255,255,255,0.78)";
    ctx.stroke();

    ctx.fillStyle = "#ff6f91";
    ctx.beginPath();
    ctx.moveTo(-12, -8);
    ctx.lineTo(-26, -18);
    ctx.lineTo(-20, -2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, 8);
    ctx.lineTo(-26, 18);
    ctx.lineTo(-20, 2);
    ctx.closePath();
    ctx.fill();

    const windowGrad = ctx.createRadialGradient(8, -3, 2, 8, -3, 7);
    windowGrad.addColorStop(0, "#ffffff");
    windowGrad.addColorStop(0.38, "#4ee7d5");
    windowGrad.addColorStop(1, "#1b4b74");
    ctx.fillStyle = windowGrad;
    ctx.beginPath();
    ctx.arc(8, -2, 6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(4, 12, 26, 0.42)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#071225";
    ctx.globalAlpha *= 0.15;
    ctx.beginPath();
    ctx.ellipse(-2, 8, 14, 3, 0, 0, TAU);
    ctx.fill();
    if (player.invuln > 0 && !player.invisible) {
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = `rgba(255, 50, 50, ${0.35 + Math.sin(state.time * 48) * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.bezierCurveTo(14, -16, -12, -15, -22, -6);
      ctx.lineTo(-22, 6);
      ctx.bezierCurveTo(-12, 15, 14, 16, 24, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    if (player.invisible && player.invisibleTimer > 0) {
      ctx.restore();
    }
  }

  function drawVignette() {
    const v = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.24, width / 2, height / 2, Math.max(width, height) * 0.72);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, width, height);
  }

  function frame(timestamp) {
    const now = timestamp / 1000;
    const dt = Math.min(0.033, now - (lastFrame || now));
    lastFrame = now;

    if (state.mode === "playing" && !state.paused) {
      update(dt);
    } else {
      state.time += dt * 0.45;
      player.flame += dt * 5;
      player.tilt = Math.sin(state.time * 1.3) * 0.08;
    }

    render();
    requestAnimationFrame(frame);
  }

  function setKey(code, down) {
    if (code === "ArrowUp" || code === "KeyW") input.up = down;
    if (code === "ArrowDown" || code === "KeyS") input.down = down;
    if (code === "ArrowLeft" || code === "KeyA") input.left = down;
    if (code === "ArrowRight" || code === "KeyD") input.right = down;
  }

  function handleKeyDown(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.code === "Enter" && state.mode !== "playing") {
      startGame();
      return;
    }
    if (event.code === "Escape" || event.code === "KeyP") {
      togglePause();
      return;
    }
    if (event.code === "Digit0") {
      const now = performance.now();
      if (now - zeroTapTime < 500) { togglePause(); zeroTapTime = 0; return; }
      zeroTapTime = now;
    }
    if (event.code === "KeyM") {
      toggleMute();
      return;
    }
    setKey(event.code, true);
    if (event.repeat) return;
    if (event.code === "Space" || event.code === "ShiftLeft" || event.code === "ShiftRight") {
      triggerDash();
    }
    if (event.code === "KeyE" || event.code === "KeyX") {
      triggerPulse();
    }
    if (event.code === "KeyQ") {
      triggerShoot();
    }
    if (event.code === "KeyG") {
      triggerLightning();
    }
    if (event.code === "KeyR") {
      triggerArrowRain();
    }
  }
  window.addEventListener("keydown", handleKeyDown);

  function handleKeyUp(event) { setKey(event.code, false); }
  window.addEventListener("keyup", handleKeyUp);

  function handlePointerDown(event) {
    if (state.mode !== "playing") return;
    event.preventDefault();
    input.pointer = true;
    input.pointerX = event.clientX;
    input.pointerY = event.clientY;
    const now = performance.now();
    if (now - input.lastTap < 280) triggerDash();
    input.lastTap = now;
  }
  canvas.addEventListener("pointerdown", handlePointerDown, { passive: false });

  function handlePointerMove(event) {
    event.preventDefault();
    input.pointer = true;
    input.pointerX = event.clientX;
    input.pointerY = event.clientY;
  }
  canvas.addEventListener("pointermove", handlePointerMove, { passive: false });

  function handleResize() { buildStars(); resize(); }
  window.addEventListener("resize", handleResize);

  // Dynamic indicator panels are pre-rendered by React HUD component.

  resize();
  let animFrameId = requestAnimationFrame(frame);

  return {
    startGame,
    returnHome,
    toggleMute,
    togglePause,
    triggerDash,
    triggerPulse,
    destroy() {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    },
  };
}