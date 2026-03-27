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
        <span className="text-sm text-gray-400">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-xl border border-red-800 px-5 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-950 transition-colors"
    >
      Delete Galaxy
    </button>
  );
}
