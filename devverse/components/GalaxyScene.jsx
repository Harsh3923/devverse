"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";

function Star() {
  const starRef = useRef();

  useFrame((state) => {
    if (!starRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    starRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <mesh ref={starRef}>
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial
        color="#facc15"
        emissive="#facc15"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function Planet({ radius, speed, size, color }) {
  const planetRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (!planetRef.current) return;

    planetRef.current.position.x = Math.cos(t) * radius;
    planetRef.current.position.z = Math.sin(t) * radius;
  });

  return (
    <mesh ref={planetRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

export default function GalaxyScene({ repos = [] }) {
  const languageColors = {
    JavaScript: "#facc15",
    Python: "#38bdf8",
    Java: "#f97316",
    TypeScript: "#818cf8",
    HTML: "#fb7185",
    CSS: "#06b6d4",
  };

  return (
    <div className="h-[500px] w-full rounded-2xl border border-gray-800 bg-black">
      <Canvas camera={{ position: [0, 8, 16], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={30} color="#facc15" />
        <Stars radius={80} depth={40} count={4000} factor={4} fade />

        <Star />

        {repos.slice(0, 12).map((repo, i) => {
          const radius = 4 + i * 1.5;
          const size = Math.max(
            0.3,
            Math.min(0.8, repo.stargazers_count / 5 + 0.3)
          );
          const speed = Math.max(0.08, 0.22 - i * 0.012);
          const color = languageColors[repo.language] || "#a78bfa";

          return (
            <Planet
              key={repo.id}
              radius={radius}
              speed={speed}
              size={size}
              color={color}
            />
          );
        })}

        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}