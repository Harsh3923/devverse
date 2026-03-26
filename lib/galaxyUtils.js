import * as THREE from "three";

// ─── Nebula Texture ────────────────────────────────────────────────────────────

export function makeNebulaTexture(color) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.2, color + "cc");
  gradient.addColorStop(0.5, color + "55");
  gradient.addColorStop(1, color + "00");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 28; i++) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.035 + Math.random() * 0.045;
    ctx.arc(Math.random() * size, Math.random() * size, 30 + Math.random() * 100, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Star (Sun) Texture ───────────────────────────────────────────────────────

export function makeStarTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const base = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  base.addColorStop(0,    "#ffffff");
  base.addColorStop(0.12, "#fff8e1");
  base.addColorStop(0.35, "#ffcc02");
  base.addColorStop(0.65, "#ff8800");
  base.addColorStop(0.88, "#cc4400");
  base.addColorStop(1,    "#771100");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 320; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 6 + Math.random() * 22;
    const bright = 0.65 + Math.random() * 0.35;
    const cell = ctx.createRadialGradient(x, y, 0, x, y, r);
    cell.addColorStop(0,   `rgba(255,230,120,${bright * 0.35})`);
    cell.addColorStop(0.6, `rgba(220,110,10,${bright * 0.12})`);
    cell.addColorStop(1,   `rgba(150,40,0,0)`);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = cell;
    ctx.fill();
  }

  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.08 + Math.random() * 0.38) * (size / 2);
    const cx = size / 2 + Math.cos(angle) * dist;
    const cy = size / 2 + Math.sin(angle) * dist * 0.35;
    const r  = 7 + Math.random() * 16;
    const umbra = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    umbra.addColorStop(0, "rgba(30,5,0,0.92)");
    umbra.addColorStop(0.55, "rgba(60,15,0,0.7)");
    umbra.addColorStop(1,   "rgba(120,40,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = umbra;
    ctx.fill();
    const pen = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 2.2);
    pen.addColorStop(0, "rgba(160,60,0,0.18)");
    pen.addColorStop(1, "rgba(200,80,0,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = pen;
    ctx.fill();
  }

  for (let i = 0; i < 18; i++) {
    const x = size * 0.25 + Math.random() * size * 0.5;
    const y = size * 0.35 + Math.random() * size * 0.3;
    const r = 4 + Math.random() * 10;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,250,200,0.22)`;
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Planet Textures ──────────────────────────────────────────────────────────

export function makePlanetTexture(base, accent, detail, type = "rocky") {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const sphere = ctx.createRadialGradient(
    size * 0.34, size * 0.32, size * 0.06,
    size * 0.5,  size * 0.5,  size * 0.64
  );
  sphere.addColorStop(0,    accent);
  sphere.addColorStop(0.42, base);
  sphere.addColorStop(1,    detail);
  ctx.fillStyle = sphere;
  ctx.fillRect(0, 0, size, size);

  if (type === "gas") {
    for (let i = 0; i < 46; i++) {
      const y  = (i / 46) * size;
      const bh = size / 46 + Math.random() * 7;
      const alpha = 0.07 + Math.random() * 0.21;
      const col   = i % 3 === 0 ? accent : i % 3 === 1 ? detail : base;
      const hex   = Math.floor(alpha * 255).toString(16).padStart(2, "0");
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= size; x += 16) {
        ctx.lineTo(x, y + Math.sin(x * 0.025 + i * 0.8) * 9);
      }
      for (let x = size; x >= 0; x -= 16) {
        ctx.lineTo(x, y + bh + Math.sin(x * 0.025 + i * 0.8 + 0.6) * 9);
      }
      ctx.closePath();
      ctx.fillStyle = col + hex;
      ctx.fill();
    }
    const sx = size * 0.62, sy = size * 0.54;
    const storm = ctx.createRadialGradient(sx, sy, 0, sx, sy, 36);
    storm.addColorStop(0,   accent + "dd");
    storm.addColorStop(0.5, base   + "88");
    storm.addColorStop(1,   detail + "22");
    ctx.beginPath();
    ctx.ellipse(sx, sy, 36, 22, 0.12, 0, Math.PI * 2);
    ctx.fillStyle = storm;
    ctx.fill();
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.08 + Math.random() * 0.12;
      ctx.lineWidth   = 1 + Math.random() * 3;
      const y = Math.random() * size;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        size * 0.25, y + (Math.random() * 24 - 12),
        size * 0.75, y + (Math.random() * 24 - 12),
        size, y + (Math.random() * 14 - 7)
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (type === "lava") {
    ctx.fillStyle = "rgba(30,10,5,0.45)";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 28; i++) {
      ctx.beginPath();
      ctx.globalAlpha = 0.55 + Math.random() * 0.35;
      ctx.lineWidth   = 1.5 + Math.random() * 4;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = "#ff4400";
      const startX = Math.random() * size;
      const startY = Math.random() * size;
      ctx.moveTo(startX, startY);
      let px = startX, py = startY;
      for (let j = 0; j < 5; j++) {
        px += (Math.random() - 0.5) * 90;
        py += (Math.random() - 0.5) * 90;
        const grad = ctx.createLinearGradient(startX, startY, px, py);
        grad.addColorStop(0, "#ff6600");
        grad.addColorStop(1, "#ffaa00");
        ctx.strokeStyle = grad;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 5 + Math.random() * 22;
      const pool = ctx.createRadialGradient(x, y, 0, x, y, r);
      pool.addColorStop(0,   "rgba(255,180,0,0.85)");
      pool.addColorStop(0.45,"rgba(255,80,0,0.55)");
      pool.addColorStop(1,   "rgba(180,20,0,0)");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = pool;
      ctx.fill();
    }
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 8 + Math.random() * 30;
      ctx.globalAlpha = 0.35 + Math.random() * 0.35;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = detail;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (type === "ice") {
    const iceCap = ctx.createLinearGradient(0, 0, 0, size * 0.28);
    iceCap.addColorStop(0, "rgba(255,255,255,0.92)");
    iceCap.addColorStop(1, "rgba(220,240,255,0)");
    ctx.fillStyle = iceCap;
    ctx.fillRect(0, 0, size, size * 0.28);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const len = 30 + Math.random() * 100;
      const angle = Math.random() * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.strokeStyle = i % 3 === 0 ? "#a8d4ff" : "#d0eaff";
      ctx.globalAlpha  = 0.12 + Math.random() * 0.22;
      ctx.lineWidth    = 0.8 + Math.random() * 1.8;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 12 + Math.random() * 40;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
      glow.addColorStop(0, "rgba(80,180,255,0.18)");
      glow.addColorStop(1, "rgba(40,100,200,0)");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
  }

  if (type === "rocky") {
    for (let i = 0; i < 36; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 4 + Math.random() * 24;
      if (r > 14) {
        for (let ray = 0; ray < 6; ray++) {
          const rayAngle = (ray / 6) * Math.PI * 2 + Math.random() * 0.4;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + Math.cos(rayAngle) * r * (2.5 + Math.random() * 1.5),
            y + Math.sin(rayAngle) * r * (2.5 + Math.random() * 1.5)
          );
          ctx.strokeStyle = accent;
          ctx.globalAlpha = 0.08;
          ctx.lineWidth   = 0.8 + Math.random() * 1.2;
          ctx.stroke();
        }
      }
      const floor = ctx.createRadialGradient(x + r * 0.18, y - r * 0.18, 0, x, y, r);
      floor.addColorStop(0, detail + "aa");
      floor.addColorStop(0.6, detail + "44");
      floor.addColorStop(1, detail + "00");
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = floor;
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.globalAlpha  = 0.18;
      ctx.lineWidth    = 1.5;
      ctx.stroke();
    }
    for (let i = 0; i < 14; i++) {
      const y = Math.random() * size;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        size * 0.28, y + (Math.random() * 50 - 25),
        size * 0.72, y + (Math.random() * 50 - 25),
        size, y + (Math.random() * 20 - 10)
      );
      ctx.strokeStyle = i % 2 === 0 ? accent : detail;
      ctx.globalAlpha  = 0.07;
      ctx.lineWidth    = 2 + Math.random() * 5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Planet helpers ───────────────────────────────────────────────────────────

export function getPlanetType(repo, language) {
  if (language === "Java")                          return "lava";
  if (language === "Python")                        return "ice";
  if (language === "CSS" || language === "HTML")    return "gas";
  if (language === "TypeScript")                    return "ice";
  if (repo?.stargazers_count >= 1)                  return "gas";
  return "rocky";
}

export function getPlanetPalette(language) {
  const palettes = {
    JavaScript:  { base: "#fde047", accent: "#fef9c3", detail: "#a16207" },
    TypeScript:  { base: "#a78bfa", accent: "#ede9fe", detail: "#5b21b6" },
    Python:      { base: "#34d399", accent: "#d1fae5", detail: "#065f46" },
    Java:        { base: "#fb923c", accent: "#ffedd5", detail: "#9a3412" },
    HTML:        { base: "#f87171", accent: "#fee2e2", detail: "#991b1b" },
    CSS:         { base: "#22d3ee", accent: "#cffafe", detail: "#155e75" },
    "C++":       { base: "#60a5fa", accent: "#dbeafe", detail: "#1e3a8a" },
    "C#":        { base: "#c084fc", accent: "#f3e8ff", detail: "#6b21a8" },
    C:           { base: "#94a3b8", accent: "#e2e8f0", detail: "#334155" },
    Ruby:        { base: "#f43f5e", accent: "#ffe4e6", detail: "#9f1239" },
    Go:          { base: "#2dd4bf", accent: "#ccfbf1", detail: "#134e4a" },
    Rust:        { base: "#fb7185", accent: "#ffe4e6", detail: "#881337" },
    Swift:       { base: "#ff6b35", accent: "#ffd6c0", detail: "#7c2d12" },
    Kotlin:      { base: "#a855f7", accent: "#f3e8ff", detail: "#581c87" },
    PHP:         { base: "#818cf8", accent: "#e0e7ff", detail: "#3730a3" },
    Dart:        { base: "#38bdf8", accent: "#e0f2fe", detail: "#0c4a6e" },
    Scala:       { base: "#f97316", accent: "#fff7ed", detail: "#7c2d12" },
    Shell:       { base: "#4ade80", accent: "#dcfce7", detail: "#14532d" },
    Vue:         { base: "#86efac", accent: "#f0fdf4", detail: "#166534" },
    Svelte:      { base: "#ff6b6b", accent: "#ffe0e0", detail: "#7f1d1d" },
    Lua:         { base: "#67e8f9", accent: "#ecfeff", detail: "#164e63" },
    R:           { base: "#60a5fa", accent: "#eff6ff", detail: "#1e40af" },
    Haskell:     { base: "#c4b5fd", accent: "#f5f3ff", detail: "#4c1d95" },
    Elixir:      { base: "#e879f9", accent: "#fdf4ff", detail: "#701a75" },
    Clojure:     { base: "#4ade80", accent: "#f0fdf4", detail: "#14532d" },
    Markdown:    { base: "#e2e8f0", accent: "#f8fafc", detail: "#475569" },
  };

  if (palettes[language]) return palettes[language];

  // Deterministic bright fallback based on language string hash
  const fallbacks = [
    { base: "#f472b6", accent: "#fce7f3", detail: "#831843" },
    { base: "#fb923c", accent: "#fff7ed", detail: "#7c2d12" },
    { base: "#a3e635", accent: "#f7fee7", detail: "#365314" },
    { base: "#38bdf8", accent: "#f0f9ff", detail: "#0c4a6e" },
    { base: "#fbbf24", accent: "#fffbeb", detail: "#78350f" },
    { base: "#34d399", accent: "#ecfdf5", detail: "#064e3b" },
    { base: "#e879f9", accent: "#fdf4ff", detail: "#701a75" },
    { base: "#60a5fa", accent: "#eff6ff", detail: "#1e3a8a" },
  ];
  const hash = (language || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
}

// ─── Spiral Positioning ───────────────────────────────────────────────────────

/**
 * Compute 3D world position for a contributor using a true Archimedean spiral.
 * Each successive contributor spirals outward — no rings, no grid.
 * @param {number} index  sequential contributor index (0, 1, 2 …)
 * @returns {[number, number, number]} [x, y, z]
 */
export function computeSpiralPosition(index) {
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.5° — avoids alignment
  const MIN_RADIUS   = 40;
  const GROWTH       = 22; // units per contributor

  const angle  = index * GOLDEN_ANGLE;
  const radius = MIN_RADIUS + index * GROWTH;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

/** @deprecated use computeSpiralPosition(index) instead */
export function computeSpiralArmPosition(armIndex, armT, numArms = 5) {
  const angle  = (armIndex / numArms) * Math.PI * 2 + armT * Math.PI * 2.8;
  const radius = 55 + armT * 180;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}
