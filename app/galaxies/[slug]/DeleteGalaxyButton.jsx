"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGalaxyButton({ slug }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/galaxies/${slug}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/galaxies");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete galaxy");
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: "#94a3b8" }}>Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="clay-btn-danger px-4 py-2 text-sm"
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="clay-btn-ghost px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="clay-btn-danger-ghost px-5 py-2.5 text-sm"
    >
      Delete Galaxy
    </button>
  );
}
