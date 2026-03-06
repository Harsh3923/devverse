"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

function makeNebulaTexture(color) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0, color);
  gradient.addColorStop(0.25, color + "cc");
  gradient.addColorStop(0.55, color + "55");
  gradient.addColorStop(1, color + "00");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.04 + Math.random() * 0.04;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 40 + Math.random() * 90;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function NebulaCloud({ position, color, size, opacity, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => makeNebulaTexture(color), [color]);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Star() {
  const starRef = useRef();

  useFrame((state) => {
    if (!starRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    starRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={starRef}>
      <sphereGeometry args={[1.25, 64, 64]} />
      <meshStandardMaterial
        color="#fff6b0"
        emissive="#ffd54f"
        emissiveIntensity={6}
        roughness={0.4}
        metalness={0.2}
      />
    </mesh>
  );
}

function OrbitRing({ radius }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.015, radius + 0.015, 128]} />
      <meshBasicMaterial
        color="#1e6fa5"
        transparent
        opacity={0.18}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GalaxySpiral() {
  const spiralPoints = useMemo(() => {
    const positions = [];
    const colors = [];
    const colorA = new THREE.Color("#60a5fa");
    const colorB = new THREE.Color("#a78bfa");
    const colorC = new THREE.Color("#f472b6");

    const arms = 4;
    const pointsPerArm = 350;

    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < pointsPerArm; i++) {
        const t = i / pointsPerArm;
        const angle = t * Math.PI * 6 + (arm / arms) * Math.PI * 2;
        const radius = 4 + t * 28;

        const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.2;
        const y = (Math.random() - 0.5) * 1.5;
        const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.2;

        positions.push(x, y, z);

        const mixed = new THREE.Color()
          .copy(colorA)
          .lerp(colorB, Math.random() * 0.6)
          .lerp(colorC, Math.random() * 0.35);

        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    return geometry;
  }, []);

  return (
    <points position={[0, -6, -42]} rotation={[Math.PI / 2.8, 0, 0]}>
      <primitive object={spiralPoints} attach="geometry" />
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}

function Comet() {
  const cometRef = useRef();
  const trailRef = useRef();

  useFrame((state) => {
    if (!cometRef.current || !trailRef.current) return;

    const t = state.clock.elapsedTime * 0.18;
    const cycle = (t % 1) * 2 - 1; // from -1 to 1
    const x = cycle * 36;
    const y = 8 + Math.sin(t * Math.PI * 2) * 3;
    const z = -8 + Math.cos(t * Math.PI * 2) * 2;

    cometRef.current.position.set(x, y, z);
    trailRef.current.position.set(x - 2.8, y, z);

    cometRef.current.visible = true;
    trailRef.current.visible = true;
  });

  return (
    <>
      <mesh ref={cometRef}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.95} />
      </mesh>

      <mesh ref={trailRef} rotation={[0, 0, -0.2]}>
        <planeGeometry args={[5.2, 0.35]} />
        <meshBasicMaterial
          color="#7dd3fc"
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function makePlanetTexture(base, accent, detail) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size * 0.35,
    size * 0.35,
    size * 0.08,
    size * 0.5,
    size * 0.5,
    size * 0.6
  );
  gradient.addColorStop(0, accent);
  gradient.addColorStop(0.45, base);
  gradient.addColorStop(1, detail);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 200; i=i+7) {
    ctx.beginPath();
    ctx.strokeStyle = i % 2 === 0 ? accent : detail;
    ctx.globalAlpha = 0.15 + Math.random() * 0.42;
    ctx.lineWidth = 4 + Math.random() * 18;
    const y = Math.random() * size;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      size * 0.25,
      y + (Math.random() * 40 - 20),
      size * 0.75,
      y + (Math.random() * 40 - 20),
      size,
      y + (Math.random() * 20 - 10)
    );
    ctx.stroke();
  }

  for (let i = 0; i < 80; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = accent;
    const r = 3 + Math.random() * 10;
    ctx.arc(
      Math.random() * size,
      Math.random() * size,
      r,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Planet({
  radius,
  speed,
  size,
  colors,
  hasRing = false,
  tilt = 0,
  repo,
}) {
  const groupRef = useRef();
  const planetRef = useRef();
  const ringRef = useRef();

  const [hovered, setHovered] = useState(false);

  const texture = useMemo(() => {
    if (!colors) return null;
    return makePlanetTexture(colors.base, colors.accent, colors.detail);
  }, [colors]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (!groupRef.current || !planetRef.current) return;

    groupRef.current.position.x = Math.cos(t) * radius;
    groupRef.current.position.z = Math.sin(t) * radius;

    planetRef.current.rotation.y += 0.003;

    const targetScale = hovered ? 1.12 : 1;
    planetRef.current.scale.lerp(
    new THREE.Vector3(targetScale, targetScale, targetScale),
    0.08
    );

    if (ringRef.current) {
    const ringScale = hovered ? 1.08 : 1;
    ringRef.current.scale.lerp(
        new THREE.Vector3(ringScale, ringScale, ringScale),
        0.08
    );
    }
  });

    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
    };

    const handlePointerOut = () => {
        setHovered(false);
        document.body.style.cursor = "default";
    };

  const handleClick = (e) => {
    e.stopPropagation();
    if (repo?.html_url) {
      window.open(repo.html_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        rotation={[0.2, 0, tilt]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={texture || null}
          emissive={colors.base}
          emissiveIntensity={0.35}
          roughness={0.75}
          metalness={0.08}
        />
      </mesh>

      <mesh scale={1.06}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial
          color={colors.accent}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {hasRing && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, tilt]}>
          <ringGeometry args={[size * 1.45, size * 2.15, 96]} />
          <meshBasicMaterial
            color={colors.accent}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
          />
        </mesh>)}
      {hovered && (
        <mesh scale={size * 2}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
            color={colors.accent}
            transparent
            opacity={0.12}
            side={THREE.BackSide}
            />
        </mesh>)}

      <Html
        transform
        occlude
        position={[0, size + 0.7, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: "none",
          opacity: hovered ? 1 : 0,
          transform: `scale(${hovered ? 1 : 0.96})`,
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="min-w-[150px] rounded-xl border border-cyan-400/20 bg-slate-950/80 px-4 py-3 text-center shadow-[0_0_25px_rgba(56,189,248,0.25)] backdrop-blur-md">
          <p className="truncate text-sm font-semibold text-white">
            {repo?.name || "Unknown Repo"}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-slate-300">
            <span>⭐ {repo?.stargazers_count ?? 0}</span>
            <span>🍴 {repo?.forks_count ?? 0}</span>
          </div>
          <p className="mt-1 text-[11px] text-cyan-300">
            {repo?.language || "Unknown"}
          </p>
        </div>
      </Html>
    </group>
  );
}

function getPlanetPalette(language) {
  const palettes = {
    JavaScript: {
      base: "#facc15",
      accent: "#fff08a",
      detail: "#a16207",
    },
    Python: {
      base: "#38bdf8",
      accent: "#b6f0ff",
      detail: "#155e75",
    },
    Java: {
      base: "#f97316",
      accent: "#fdba74",
      detail: "#9a3412",
    },
    TypeScript: {
      base: "#818cf8",
      accent: "#c7d2fe",
      detail: "#3730a3",
    },
    HTML: {
      base: "#fb7185",
      accent: "#fecdd3",
      detail: "#9f1239",
    },
    CSS: {
      base: "#22d3ee",
      accent: "#cffafe",
      detail: "#0f766e",
    },
  };

  return (
    palettes[language] || {
      base: "#a78bfa",
      accent: "#ddd6fe",
      detail: "#5b21b6",
    }
  );
}

export default function GalaxyScene({ repos = [] }) {
  return (
    <div className="h-[560px] w-full rounded-2xl border border-gray-800 bg-black">
      <Canvas camera={{ position: [0, 11, 24], fov: 46 }}>
        <fog attach="fog" args={["#020617", 18, 52]} />
        <ambientLight intensity={0.45} />
        <pointLight position={[0, 0, 0]} intensity={40} color="#fde047" />

        <GalaxySpiral />

        <NebulaCloud
            position={[-16, 7, -28]}
            color="#7c3aed"
            size={[18, 12]}
            opacity={0.82}
            rotation={[0, 0, -0.35]}
        />

        <NebulaCloud
            position={[14, -3, -24]}
            color="#2563eb"
            size={[16, 10]}
            opacity={0.75}
            rotation={[0, 0, 0.28]}
        />

        <NebulaCloud
            position={[0, 10, -30]}
            color="#a855f7"
            size={[22, 12]}
            opacity={0.64}
            rotation={[0, 0, 0.12]}
        />
        <Stars radius={90} depth={45} count={5000} factor={4} fade />

        <Star />

        {repos.slice(0, 12).map((repo, i) => {
          const radius = 4.5 + i * 2.1;
          const size = Math.max(
            0.34,
            Math.min(0.95, repo.stargazers_count / 4 + 0.38)
          );
          const speed = Math.max(0.06, 0.22 - i * 0.012);
          const colors = getPlanetPalette(repo.language);
          const hasRing = i % 4 === 0 || repo.forks_count > 0;
          const tilt = (i % 5) * 0.2;

          return (
            <group key={repo.id}>
              <OrbitRing radius={radius} />
              <Planet
                radius={radius}
                speed={speed}
                size={size}
                colors={colors}
                hasRing={hasRing}
                tilt={tilt}
                repo={repo}
              />
            </group>
          );
        })}

        <Comet />

        <OrbitControls
            enablePan={false}
            minDistance={12}
            maxDistance={35}
            enableDamping
            dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}