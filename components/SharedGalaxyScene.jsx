"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeNebulaTexture, computeSpiralPosition } from "@/lib/galaxyUtils";
import SolarSystem from "./SolarSystem";
import { useThree } from "@react-three/fiber";

// ─── Background (reused from GalaxyScene) ─────────────────────────────────────

function NebulaCloud({ position, color, size, opacity, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => makeNebulaTexture(color), [color]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function GalaxySpiral() {
  const geometry = useMemo(() => {
    const positions = [], colors = [];
    const cA = new THREE.Color("#60a5fa"), cB = new THREE.Color("#8b5cf6");
    const cC = new THREE.Color("#f472b6"), cD = new THREE.Color("#ffffff");
    const arms = 5, perArm = 500;
    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm;
        const angle = t * Math.PI * 7 + (arm / arms) * Math.PI * 2;
        const r = 8 + t * 230;
        positions.push(
          Math.cos(angle) * r + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 6,
          Math.sin(angle) * r + (Math.random() - 0.5) * 4
        );
        const mixed = new THREE.Color().copy(cA).lerp(cB, Math.random() * 0.7).lerp(cC, Math.random() * 0.4).lerp(cD, Math.random() * 0.08);
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points rotation={[Math.PI / 2.7, 0.15, 0]}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial size={0.5} vertexColors transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

// ─── Spaceship (same as GalaxyScene) ─────────────────────────────────────────

function SpaceshipRig({ controlsRef, startPos }) {
  const { camera } = useThree();
  const keys    = useRef({});
  const velX    = useRef(0);
  const shipPos = useRef(new THREE.Vector3(...startPos));
  const shipRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.copy(shipPos.current);
      controlsRef.current.update();
    }
    const down = (e) => { keys.current[e.code] = true; };
    const up   = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((_, delta) => {
    const SPEED = 28, DAMPING = 0.88, k = keys.current;
    const move = new THREE.Vector3();
    if (k["ArrowUp"]   || k["KeyW"]) move.z -= 1;
    if (k["ArrowDown"] || k["KeyS"]) move.z += 1;
    if (k["KeyU"])                   move.y += 1;
    if (k["KeyD"])                   move.y -= 1;
    if (move.length() > 0) move.normalize().multiplyScalar(SPEED * delta);

    if (k["ArrowLeft"] || k["KeyA"]) velX.current -= SPEED * delta;
    if (k["ArrowRight"]            ) velX.current += SPEED * delta;
    velX.current *= DAMPING;
    move.x += velX.current;

    if (move.length() > 0.0001) {
      shipPos.current.add(move);
      camera.position.add(move);
      if (controlsRef.current) { controlsRef.current.target.copy(shipPos.current); controlsRef.current.update(); }
    }
    if (shipRef.current) {
      shipRef.current.position.copy(shipPos.current);
      shipRef.current.rotation.z = THREE.MathUtils.lerp(shipRef.current.rotation.z, -velX.current * 1.8, 0.12);
    }
  });

  return (
    <group ref={shipRef}>
      <group rotation={[-0.35, 0.2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.115, 1.0, 8]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.55} roughness={0.28} emissive="#94a3b8" emissiveIntensity={0.18} />
        </mesh>
        <mesh position={[0, 0, -0.62]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.065, 0.35, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.22} />
        </mesh>
        <mesh position={[0, 0.095, -0.11]}>
          <sphereGeometry args={[0.065, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.82} roughness={0} metalness={0.05} emissive="#0ea5e9" emissiveIntensity={0.7} />
        </mesh>
        <mesh position={[-0.32, -0.012, 0.085]} rotation={[0.05, -0.18, Math.PI / 15]}>
          <boxGeometry args={[0.52, 0.022, 0.32]} /><meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0.32, -0.012, 0.085]} rotation={[-0.05, 0.18, -Math.PI / 15]}>
          <boxGeometry args={[0.52, 0.022, 0.32]} /><meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[-0.11, -0.03, 0.56]}><sphereGeometry args={[0.033, 16, 16]} /><meshBasicMaterial color="#38bdf8" /></mesh>
        <pointLight position={[-0.11, -0.03, 0.56]} color="#38bdf8" intensity={1.2} distance={2.0} decay={2} />
        <mesh position={[0.11, -0.03, 0.56]}><sphereGeometry args={[0.033, 16, 16]} /><meshBasicMaterial color="#38bdf8" /></mesh>
        <pointLight position={[0.11, -0.03, 0.56]} color="#38bdf8" intensity={1.2} distance={2.0} decay={2} />
        <Sparkles count={28} scale={[0.15, 0.15, 0.55]} position={[0, -0.03, 0.63]} color="#38bdf8" size={2.0} speed={0.65} opacity={0.85} />
      </group>
    </group>
  );
}

// ─── Animated arrival for new solar systems ───────────────────────────────────

function ArrivingSolarSystem({ position, user, repos, activeRepoId, onActivate, isNew }) {
  const groupRef  = useRef();
  const scaleRef  = useRef(isNew ? 0 : 1);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    scaleRef.current = Math.min(1, scaleRef.current + delta * 0.6);
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef}>
      <SolarSystem position={position} user={user} repos={repos} activeRepoId={activeRepoId} onActivate={onActivate} />
    </group>
  );
}

// ─── Shared Galaxy Scene ──────────────────────────────────────────────────────

export default function SharedGalaxyScene({ contributors, newIds = new Set() }) {
  const [activeRepoId, setActiveRepoId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef  = useRef();
  const containerRef = useRef();

  // Start camera well above and behind the galaxy center
  const cameraStart = [0, 80, 200];

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl border border-gray-800 bg-black ${isFullscreen ? "" : "scene-height-lg"}`}
      style={{ height: isFullscreen ? "100vh" : undefined }}
    >
      {/* Overlay */}
      <div style={{ position: "absolute", bottom: "14px", right: "16px", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
          style={{ background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          )}
        </button>
        <div className="scene-kb-hint" style={{ gap: "4px", alignItems: "center", pointerEvents: "none", background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: "10px", padding: "6px 10px", fontSize: "10px", color: "#64748b", letterSpacing: "0.05em" }}>
          <span style={{ color: "#38bdf8" }}>🚀</span>
          <span>W/S ↑↓ — fwd/back · A/← — left · → — right · U/D — up/down · Drag — orbit · Scroll — zoom</span>
        </div>
      </div>

      <Canvas camera={{ position: cameraStart, fov: 50 }} onPointerMissed={() => setActiveRepoId(null)}>
        <fog attach="fog" args={["#000008", 80, 800]} />
        <ambientLight intensity={0.06} color="#1a2550" />

        <GalaxySpiral />
        <Stars radius={500} depth={120} count={10000} factor={6} fade />
        <Stars radius={200} depth={60}  count={4000}  factor={3} fade />

        <NebulaCloud position={[-80, 20, -150]} color="#7c3aed" size={[120, 80]} opacity={0.12} rotation={[0, 0, -0.2]} />
        <NebulaCloud position={[100, -15, -120]} color="#2563eb" size={[100, 60]} opacity={0.10} rotation={[0, 0, 0.25]} />
        <NebulaCloud position={[0, 40, -200]}   color="#a855f7" size={[150, 80]} opacity={0.08} rotation={[0, 0, 0.1]} />

        {contributors.map((c, idx) => {
          const [x, , z] = computeSpiralPosition(idx);
          const position = [x, 0, z];
          const user  = c.github_data?.user  || {};
          const repos = c.github_data?.repos || [];
          return (
            <ArrivingSolarSystem
              key={c.id}
              position={position}
              user={user}
              repos={repos}
              activeRepoId={activeRepoId}
              onActivate={(id) => setActiveRepoId(id)}
              isNew={newIds.has(c.id)}
            />
          );
        })}

        <SpaceshipRig controlsRef={controlsRef} startPos={cameraStart} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={5}
          maxDistance={800}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
