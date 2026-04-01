"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshGalaxyButton({ slug }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/galaxies/${slug}/refresh`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to refresh.");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      title="Refresh GitHub data for all contributors"
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        fontSize: 18,
        opacity: loading ? 0.4 : 0.65,
        padding: "2px 4px",
        lineHeight: 1,
        transition: "opacity 0.2s",
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "0.65"; }}
    >
      {loading ? "⏳" : "🔄"}
    </button>
  );
}
