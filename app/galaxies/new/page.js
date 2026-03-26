"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewGalaxyPage() {
  const router = useRouter();
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy]     = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/galaxies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), createdBy: createdBy.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push(`/galaxies/${data.slug}`);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/galaxies" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to galaxies
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8">
          <h1 className="text-3xl font-bold mb-2">🌌 Create a Galaxy</h1>
          <p className="text-gray-400 mb-8 text-sm">Give your shared universe a name. Others can join and add their solar system.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Galaxy name *</label>
              <input
                type="text"
                placeholder="e.g. React Devs, My Team, Open Source"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description <span className="text-gray-600">(optional)</span></label>
              <textarea
                placeholder="What's this galaxy about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

                    <div>
              <label className="block text-sm text-gray-400 mb-2">Your GitHub username *</label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                maxLength={39}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !createdBy.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Galaxy →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
