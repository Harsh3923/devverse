"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeNebulaTexture } from "@/lib/galaxyUtils";
import SolarSystem from "./SolarSystem";

// ─── Background Components ────────────────────────────────────────────────────

function NebulaCloud({ position, color, size, opacity, rotation = [0, 0, 0] }) {
  const texture = useMemo(() => makeNebulaTexture(color), [color]);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function StarFieldBand() {
  return (
    <>
      <NebulaCloud position={[-10, 8, -42]} color="#4f46e5" size={[34, 10]} opacity={0.18} rotation={[0, 0, -0.18]} />
      <NebulaCloud position={[2, 7, -43]}   color="#7c3aed" size={[38, 12]} opacity={0.16} rotation={[0, 0, -0.12]} />
      <NebulaCloud position={[16, 6, -44]}  color="#ec4899" size={[28, 10]} opacity={0.11} rotation={[0, 0, -0.08]} />
      <NebulaCloud position={[0, 7, -45]}   color="#ffffff" size={[30, 6]}  opacity={0.05} rotation={[0, 0, -0.1]}  />
    </>
  );
}

function GalaxySpiral() {
  const geometry = useMemo(() => {
    const positions = [];
    const colors    = [];
    const cA = new THREE.Color("#60a5fa");
    const cB = new THREE.Color("#8b5cf6");
    const cC = new THREE.Color("#f472b6");
    const cD = new THREE.Color("#ffffff");
    const arms = 5, perArm = 420;
    for (let arm = 0; arm < arms; arm++) {
      for (let i = 0; i < perArm; i++) {
        const t = i / perArm;
        const angle = t * Math.PI * 7 + (arm / arms) * Math.PI * 2;
        const r = 3 + t * 30;
        positions.push(
          Math.cos(angle) * r + (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.2,
          Math.sin(angle) * r + (Math.random() - 0.5) * 1.4
        );
        const mixed = new THREE.Color().copy(cA)
          .lerp(cB, Math.random() * 0.7)
          .lerp(cC, Math.random() * 0.4)
          .lerp(cD, Math.random() * 0.08);
        colors.push(mixed.r, mixed.g, mixed.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points position={[0, -4, -55]} rotation={[Math.PI / 2.7, 0.15, 0]}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial size={0.16} vertexColors transparent opacity={0.42} depthWrite={false} />
    </points>
  );
}

// ─── Comet ────────────────────────────────────────────────────────────────────

function Comet() {
  const cometRef = useRef();
  const trailRef = useRef();

  useFrame(({ clock }) => {
    if (!cometRef.current || !trailRef.current) return;
    const t = clock.elapsedTime * 0.08;
    const cycle = (t % 1) * 2 - 1;
    const x = cycle * 38;
    const y = 8 + Math.sin(t * Math.PI * 2) * 2.5;
    const z = -10 + Math.cos(t * Math.PI * 2) * 2;
    cometRef.current.position.set(x, y, z);
    trailRef.current.position.set(x - 3.2, y, z);
  });

  return (
    <>
      <mesh ref={cometRef}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.95} />
      </mesh>
      <mesh ref={trailRef} rotation={[0, 0, -0.15]}>
        <planeGeometry args={[5.6, 0.32]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

// ─── Spaceship + Camera Rig ────────────────────────────────────────────────────

function SpaceshipRig({ controlsRef }) {
  const { camera } = useThree();
  const keys    = useRef({});
  const velX    = useRef(0);
  const shipPos = useRef(new THREE.Vector3(0, 9, 19));
  const shipRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 9, 19);
      controlsRef.current.update();
    }
    const down = (e) => { keys.current[e.code] = true; };
    const up   = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  useFrame((_, delta) => {
    const SPEED   = 8;
    const DAMPING = 0.88;
    const k = keys.current;

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
      if (controlsRef.current) {
        controlsRef.current.target.copy(shipPos.current);
        controlsRef.current.update();
      }
    }

    if (shipRef.current) {
      shipRef.current.position.copy(shipPos.current);
      shipRef.current.rotation.z = THREE.MathUtils.lerp(
        shipRef.current.rotation.z, -velX.current * 1.8, 0.12
      );
    }
  });

  return (
    <group ref={shipRef}>
      <group rotation={[-0.35, 0.2, 0]}>
        {/* ── Fuselage ── */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.065, 0.115, 1.0, 8]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.55} roughness={0.28} emissive="#94a3b8" emissiveIntensity={0.18} />
        </mesh>
        {/* ── Nose cone ── */}
        <mesh position={[0, 0, -0.62]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.065, 0.35, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.22} />
        </mesh>
        {/* ── Cockpit glass ── */}
        <mesh position={[0, 0.095, -0.11]}>
          <sphereGeometry args={[0.065, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.82} roughness={0} metalness={0.05} emissive="#0ea5e9" emissiveIntensity={0.7} />
        </mesh>
        {/* ── Wings ── */}
        <mesh position={[-0.32, -0.012, 0.085]} rotation={[0.05, -0.18, Math.PI / 15]}>
          <boxGeometry args={[0.52, 0.022, 0.32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} />
        </mesh>
        <mesh position={[0.32, -0.012, 0.085]} rotation={[-0.05, 0.18, -Math.PI / 15]}>
          <boxGeometry args={[0.52, 0.022, 0.32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} />
        </mesh>
        {/* ── Engine pods ── */}
        <mesh position={[-0.11, -0.03, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.11, -0.03, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* ── Engine glows ── */}
        <mesh position={[-0.11, -0.03, 0.56]}>
          <sphereGeometry args={[0.033, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[-0.11, -0.03, 0.56]} color="#38bdf8" intensity={1.2} distance={2.0} decay={2} />
        <mesh position={[0.11, -0.03, 0.56]}>
          <sphereGeometry args={[0.033, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight position={[0.11, -0.03, 0.56]} color="#38bdf8" intensity={1.2} distance={2.0} decay={2} />
        {/* ── Nav lights ── */}
        <mesh position={[-0.53, 0, 0.085]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <pointLight position={[-0.53, 0, 0.085]} color="#ef4444" intensity={0.4} distance={0.9} decay={2} />
        <mesh position={[0.53, 0, 0.085]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
        <pointLight position={[0.53, 0, 0.085]} color="#22c55e" intensity={0.4} distance={0.9} decay={2} />
        {/* ── Thruster ── */}
        <Sparkles count={28} scale={[0.15, 0.15, 0.55]} position={[0, -0.03, 0.63]} color="#38bdf8" size={2.0} speed={0.65} opacity={0.85} />
      </group>
    </group>
  );
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function GalaxyScene({ repos = [], user = {} }) {
  const [activeRepoId, setActiveRepoId] = useState(null);
  const [isFullscreen, setIsFullscreen]  = useState(false);
  const controlsRef  = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl border border-gray-800 bg-[radial-gradient(circle_at_center,_#070d1a_0%,_#020617_50%,_#000000_100%)] ${isFullscreen ? "" : "scene-height"}`}
      style={{ height: isFullscreen ? "100vh" : undefined }}
    >
      {/* Bottom-right overlay */}
      <div style={{
        position: "absolute", bottom: "14px", right: "16px", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px",
      }}>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
          style={{
            background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(56,189,248,0.2)", borderRadius: "8px",
            padding: "6px", cursor: "pointer", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
        >
          {isFullscreen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
              <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          )}
        </button>
        <div className="scene-kb-hint" style={{
          gap: "4px", alignItems: "center", pointerEvents: "none",
          background: "rgba(2,6,23,0.75)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(56,189,248,0.15)", borderRadius: "10px",
          padding: "6px 10px", fontSize: "10px", color: "#64748b", letterSpacing: "0.05em",
        }}>
          <span style={{ color: "#38bdf8" }}>🚀</span>
          <span>W/S ↑↓ — fwd/back · A/← — left · → — right · U/D — up/down</span>
          <span style={{ color: "#475569" }}>·</span>
          <span>Drag — orbit · Scroll — zoom</span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 11, 24], fov: 46 }} onPointerMissed={() => setActiveRepoId(null)}>
        <fog attach="fog" args={["#010510", 20, 62]} />
        <ambientLight intensity={0.07} color="#1a2550" />
        <pointLight position={[0, 0, 0]} intensity={95} color="#ffcc44" distance={60} decay={2} />
        <pointLight position={[1.5, 0.8, 1.5]} intensity={8} color="#ff8833" distance={28} decay={2} />

        <GalaxySpiral />
        <StarFieldBand />
        <NebulaCloud position={[-16, 7, -28]}  color="#7c3aed" size={[18, 12]} opacity={0.18} rotation={[0, 0, -0.35]} />
        <NebulaCloud position={[14, -3, -24]}   color="#2563eb" size={[16, 10]} opacity={0.14} rotation={[0, 0,  0.28]} />
        <NebulaCloud position={[0,  10, -30]}   color="#a855f7" size={[22, 12]} opacity={0.12} rotation={[0, 0,  0.12]} />

        <Stars radius={110} depth={60} count={7000} factor={4} fade />
        <Stars radius={60}  depth={25} count={2500} factor={2} fade />

        <SolarSystem
          position={[0, 0, 0]}
          user={user}
          repos={repos}
          activeRepoId={activeRepoId}
          onActivate={(id) => setActiveRepoId(id)}
        />

        <Comet />
        <SpaceshipRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2}
          maxDistance={22}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
