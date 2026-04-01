"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditGalaxyButton({ slug, initialName, initialDescription }) {
  const router = useRouter();
  const [editing, setEditing]         = useState(false);
  const [name, setName]               = useState(initialName || "");
  const [description, setDescription] = useState(initialDescription || "");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (name.trim().length > 60) { setError("Name must be 60 characters or fewer."); return; }
    if (description.length > 200) { setError("Description must be 200 characters or fewer."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/galaxies/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update."); return; }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(initialName || "");
    setDescription(initialDescription || "");
    setError("");
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="clay-btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
        style={{ border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}
      >
        ✏️ Edit
      </button>
    );
  }

  return (
    <div className="clay-card p-4 mb-4 sm:p-5" style={{ border: "1px solid rgba(34,197,94,0.15)" }}>
      <div
        className="mb-1 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#4ade80" }}
      >
        Edit Galaxy
      </div>
      <div className="mt-3 flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs" style={{ color: "#86efac" }}>
            Name <span style={{ color: "#64748b" }}>({name.length}/60)</span>
          </label>
          <input
            className="clay-input w-full px-3 py-2 text-sm"
            value={name}
            maxLength={60}
            onChange={e => setName(e.target.value)}
            placeholder="Galaxy name"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs" style={{ color: "#86efac" }}>
            Description <span style={{ color: "#64748b" }}>({description.length}/200)</span>
          </label>
          <textarea
            className="clay-input w-full px-3 py-2 text-sm resize-none"
            rows={3}
            value={description}
            maxLength={200}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description (optional)"
          />
        </div>
        {error && (
          <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p>
        )}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={loading}
            className="clay-btn-primary px-4 py-2 text-sm"
          >
            {loading ? "Saving…" : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="clay-btn-ghost px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
