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
        className="clay-input flex-1 px-4 py-3 text-sm"
      />
      <button
        type="submit"
        className="clay-btn-primary px-6 py-3 text-sm"
      >
        Explore
      </button>
    </form>
  );
}
