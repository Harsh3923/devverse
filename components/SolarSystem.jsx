"use client";

import { useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { makeStarTexture, makePlanetTexture, getPlanetType, getPlanetPalette } from "@/lib/galaxyUtils";

// ─── Star (Sun) ───────────────────────────────────────────────────────────────

function Star({ username = "", totalRepos = 0 }) {
  const coreRef    = useRef();
  const chromoRef  = useRef();
  const corona1Ref = useRef();
  const corona2Ref = useRef();
  const corona3Ref = useRef();
  const outerRef   = useRef();

  const starTexture = useMemo(() => makeStarTexture(), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.0008;
      coreRef.current.rotation.z += 0.0003;
      const p = 1 + Math.sin(t * 1.6) * 0.018;
      coreRef.current.scale.setScalar(p);
    }
    if (chromoRef.current) {
      const p = 1 + Math.sin(t * 2.1 + 0.5) * 0.028;
      chromoRef.current.scale.setScalar(p);
    }
    if (corona1Ref.current) {
      corona1Ref.current.rotation.z -= 0.0006;
      const p = 1 + Math.sin(t * 0.9 + 1.0) * 0.04;
      corona1Ref.current.scale.setScalar(p);
    }
    if (corona2Ref.current) {
      const p = 1 + Math.sin(t * 0.6 + 2.2) * 0.055;
      corona2Ref.current.scale.setScalar(p);
    }
    if (corona3Ref.current) {
      const p = 1 + Math.sin(t * 0.38 + 3.8) * 0.07;
      corona3Ref.current.scale.setScalar(p);
    }
    if (outerRef.current) {
      const p = 1 + Math.sin(t * 0.22 + 5.1) * 0.09;
      outerRef.current.scale.setScalar(p);
    }
  });

  return (
    <group>
      <mesh
        ref={coreRef}
      >
        <sphereGeometry args={[0.95, 64, 64]} />
        <meshStandardMaterial
          map={starTexture}
          emissive="#ff8800"
          emissiveIntensity={1.6}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh ref={chromoRef} scale={1.14}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial color="#ffaa22" transparent opacity={0.14} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={corona1Ref} scale={1.55}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffcc44" transparent opacity={0.072} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={corona2Ref} scale={2.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ff7700" transparent opacity={0.038} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={corona3Ref} scale={3.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ff4400" transparent opacity={0.018} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={outerRef} scale={5.5}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#ff3300" transparent opacity={0.007} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      <Sparkles count={90} scale={[5.5, 5.5, 5.5]} size={1.8} speed={0.28} opacity={0.55} color="#ffcc44" />

      {/* Username tooltip */}
      <Html position={[0, 2.6, 0]} center zIndexRange={[100, 0]} style={{
        pointerEvents: "none",
        opacity: 1,
      }}>
        <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", width: "200px" }}>
          <div style={{
            borderRadius: "16px", padding: "1px",
            background: "linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.3) 50%, rgba(234,88,12,0.4) 100%)",
            boxShadow: "0 0 40px rgba(251,191,36,0.18), 0 0 80px rgba(251,191,36,0.08)",
          }}>
            <div style={{
              borderRadius: "15px",
              background: "linear-gradient(160deg, rgba(12,6,2,0.97) 0%, rgba(20,10,2,0.96) 100%)",
              backdropFilter: "blur(20px)", padding: "14px 16px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "20%", right: "20%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.7), transparent)",
              }} />
              <div style={{ marginBottom: "8px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 9px", borderRadius: "20px", fontSize: "10px",
                  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "rgba(251,191,36,0.1)", color: "#fcd34d",
                  border: "1px solid rgba(251,191,36,0.25)",
                }}>
                  ⭐ Central Star
                </span>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#fef3c7", marginBottom: "6px", letterSpacing: "-0.01em" }}>
                @{username || "unknown"}
              </p>
              <p style={{ fontSize: "11px", color: "#a16207", margin: 0 }}>
                {totalRepos} repositories orbiting
              </p>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── Orbit Ring ───────────────────────────────────────────────────────────────

function OrbitRing({ radius }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.007, radius + 0.007, 256]} />
      <meshBasicMaterial color="#7aadcc" transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ─── Planet ───────────────────────────────────────────────────────────────────

function Planet({ radius, speed, size, colors, hasRing = false, tilt = 0, repo, planetType = "rocky", isActive = false, onActivate }) {
  const groupRef  = useRef();
  const planetRef = useRef();
  const ringRef   = useRef();
  const [hovered, setHovered] = useState(false);

  const texture = useMemo(
    () => makePlanetTexture(colors.base, colors.accent, colors.detail, planetType),
    [colors, planetType]
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed;
    if (!groupRef.current || !planetRef.current) return;
    groupRef.current.position.x = Math.cos(t) * radius;
    groupRef.current.position.z = Math.sin(t) * radius;
    groupRef.current.position.y = Math.sin(t * 0.7 + radius) * 0.12;
    planetRef.current.rotation.y += 0.0035;
    const target = hovered ? 1.1 : 1;
    planetRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.09);
    if (ringRef.current) {
      const rs = hovered ? 1.07 : 1;
      ringRef.current.scale.lerp(new THREE.Vector3(rs, rs, rs), 0.09);
    }
  });

  const atmColor   = planetType === "ice"  ? "#a8d4ff" : planetType === "gas"  ? colors.accent : planetType === "lava" ? "#ff5500" : colors.accent;
  const atmOpacity = planetType === "ice"  ? 0.10 : planetType === "gas"  ? 0.07 : planetType === "lava" ? 0.13 : 0.05;
  const emissiveColor     = planetType === "lava" ? "#ff4400" : colors.base;
  const emissiveIntensity = planetType === "lava" ? 0.9
                          : planetType === "ice"  ? 0.55
                          : planetType === "gas"  ? 0.45
                          : 0.38;

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        rotation={[0.2, 0, tilt]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onActivate(); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <sphereGeometry args={[size, 64, 64]} />
        <meshStandardMaterial
          map={texture} emissive={emissiveColor} emissiveIntensity={emissiveIntensity}
          roughness={planetType === "ice" ? 0.3 : planetType === "gas" ? 0.6 : 0.55}
          metalness={planetType === "lava" ? 0.18 : 0.03}
        />
      </mesh>

      <mesh scale={1.065}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshBasicMaterial color={atmColor} transparent opacity={atmOpacity} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={colors.base} transparent opacity={0.012} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {hasRing && (
        <group ref={ringRef} rotation={[Math.PI / 2.4, 0, tilt]}>
          <mesh>
            <ringGeometry args={[size * 1.45, size * 2.12, 128]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.52} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[size * 1.45, size * 1.72, 128]} />
            <meshBasicMaterial color={colors.base} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[size * 1.72, size * 1.78, 128]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      )}

      {hovered && (
        <mesh scale={size * 2.4}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.09} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      <Html position={[0, size + 1.2, 0]} center zIndexRange={[100, 0]} style={{
        pointerEvents: isActive ? "auto" : "none",
        opacity: isActive ? 1 : 0,
        transform: isActive ? "translateY(0) scale(1)" : "translateY(4px) scale(0.97)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
      }}>
        <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", width: "220px" }}>
          <div style={{
            borderRadius: "18px", padding: "1px",
            background: "linear-gradient(135deg, rgba(56,189,248,0.35) 0%, rgba(139,92,246,0.25) 50%, rgba(56,189,248,0.15) 100%)",
            boxShadow: "0 0 40px rgba(56,189,248,0.12), 0 0 80px rgba(56,189,248,0.06)",
          }}>
            <div style={{
              borderRadius: "17px",
              background: "linear-gradient(160deg, rgba(2,8,28,0.97) 0%, rgba(4,12,40,0.96) 100%)",
              backdropFilter: "blur(20px)", padding: "16px", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
                background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.6), transparent)",
              }} />
              <div style={{ marginBottom: "10px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 9px", borderRadius: "20px", fontSize: "10px",
                  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  ...(planetType === "gas"  ? { background: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "1px solid rgba(245,158,11,0.25)" } :
                     planetType === "lava" ? { background: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" } :
                     planetType === "ice"  ? { background: "rgba(56,189,248,0.12)", color: "#7dd3fc", border: "1px solid rgba(56,189,248,0.25)" } :
                                             { background: "rgba(148,163,184,0.1)", color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.2)" }),
                }}>
                  {planetType === "gas" ? "⚡" : planetType === "lava" ? "🌋" : planetType === "ice" ? "❄️" : "🪨"}
                  {" "}{planetType} planet
                </span>
              </div>
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "10px", letterSpacing: "-0.01em" }}>
                {repo?.name || "Unknown Repo"}
              </p>
              <div style={{ height: "1px", margin: "0 0 10px 0", background: "linear-gradient(90deg, transparent, rgba(100,116,139,0.4), transparent)" }} />
              <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                  ⭐ <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{repo?.stargazers_count ?? 0}</span>
                </span>
                <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                  🍴 <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{repo?.forks_count ?? 0}</span>
                </span>
              </div>
              {repo?.language && (
                <div style={{ marginBottom: "14px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
                    ...(repo.language === "JavaScript" ? { background: "rgba(250,204,21,0.1)",  color: "#fde047" } :
                       repo.language === "TypeScript" ? { background: "rgba(129,140,248,0.1)", color: "#a5b4fc" } :
                       repo.language === "Python"     ? { background: "rgba(56,189,248,0.1)",  color: "#7dd3fc" } :
                       repo.language === "Java"       ? { background: "rgba(249,115,22,0.1)",  color: "#fdba74" } :
                       repo.language === "HTML"       ? { background: "rgba(251,113,133,0.1)", color: "#fda4af" } :
                       repo.language === "CSS"        ? { background: "rgba(34,211,238,0.1)",  color: "#67e8f9" } :
                                                        { background: "rgba(167,139,250,0.1)", color: "#c4b5fd" }),
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", opacity: 0.85 }} />
                    {repo.language}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); if (repo?.html_url) window.open(repo.html_url, "_blank", "noopener,noreferrer"); }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #0891b2 0%, #2563eb 100%)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(56,189,248,0.4), 0 4px 12px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #0e7490 0%, #1d4ed8 100%)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(56,189,248,0.2), 0 2px 8px rgba(0,0,0,0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
                style={{
                  width: "100%", cursor: "pointer", border: "none", borderRadius: "12px",
                  padding: "9px 0", fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "0.02em",
                  background: "linear-gradient(135deg, #0e7490 0%, #1d4ed8 100%)",
                  boxShadow: "0 0 12px rgba(56,189,248,0.2), 0 2px 8px rgba(0,0,0,0.3)",
                  transition: "all 0.18s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                }}>
                🚀 Travel to Repository
              </button>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// ─── Solar System ─────────────────────────────────────────────────────────────

export default function SolarSystem({ position = [0, 0, 0], user = {}, repos = [], activeRepoId, onActivate }) {
  const username   = user?.login || "";
  const totalRepos = repos.length;

  return (
    <group position={position}>
      <Star username={username} totalRepos={totalRepos} />
      <group rotation={[-0.35, 0.2, 0]}>
        {repos.slice(0, 12).map((repo, i) => {
          const radius     = 4.5 + i * 2.1;
          const size       = Math.max(0.34, Math.min(0.95, repo.stargazers_count / 4 + 0.38));
          const speed      = Math.max(0.06, 0.22 - i * 0.012);
          const colors     = getPlanetPalette(repo.language);
          const hasRing    = i % 4 === 0 || repo.forks_count > 0;
          const tilt       = (i % 5) * 0.2;
          const planetType = getPlanetType(repo, repo.language);
          return (
            <group key={repo.id}>
              <OrbitRing radius={radius} />
              <Planet
                radius={radius} speed={speed} size={size} colors={colors}
                hasRing={hasRing} tilt={tilt} repo={repo} planetType={planetType}
                isActive={activeRepoId === repo.id}
                onActivate={() => onActivate(repo.id)}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}
