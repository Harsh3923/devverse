"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LeaveGalaxyButton({ slug }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);

  const handleLeave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/galaxies/${slug}/contribute`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to leave galaxy.");
        return;
      }
      router.push("/galaxies");
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "#fca5a5" }}>Are you sure?</span>
        <button
          onClick={handleLeave}
          disabled={loading}
          className="px-3 py-2 text-xs font-semibold rounded-xl transition-all"
          style={{
            background: "linear-gradient(145deg, #7f1d1d, #991b1b)",
            color: "#fef2f2",
            border: "1px solid rgba(185,28,28,0.5)",
            boxShadow: "4px 4px 12px rgba(185,28,28,0.3)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Leaving…" : "Yes, leave"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="clay-btn-ghost px-3 py-2 text-xs"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="clay-btn-ghost px-5 py-2.5 text-sm text-center"
      style={{ border: "1px solid rgba(185,28,28,0.35)", color: "#fca5a5" }}
    >
      🚪 Leave Galaxy
    </button>
  );
}
