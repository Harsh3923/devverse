"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim()) return;

    router.push(`/galaxy/${username}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6">

      <h1 className="text-6xl font-bold mb-6">
        Code Galaxy 🌌
      </h1>

      <p className="text-gray-400 mb-10 text-center max-w-xl">
        Explore any GitHub developer as a solar system where repositories
        become planets and coding activity powers the star.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-6 py-3 rounded-lg bg-gray-900 border border-gray-700 outline-none"
        />

        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Explore
        </button>
      </form>

    </main>
  );
}
