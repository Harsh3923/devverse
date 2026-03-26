"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SoloExplorer() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/galaxy/${username.trim()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        placeholder="GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="flex-1 rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
      />
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 transition-colors"
      >
        Explore
      </button>
    </form>
  );
}
