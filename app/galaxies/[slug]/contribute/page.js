"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ContributePage() {
  const router = useRouter();
  const { slug } = useParams();
  const [username, setUsername] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/galaxies/${slug}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push(`/galaxies/${slug}`);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href={`/galaxies/${slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to galaxy
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8">
          <h1 className="text-3xl font-bold mb-2">🪐 Add Your Solar System</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Enter your GitHub username. Your repositories will become planets orbiting your star in this galaxy.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">GitHub username *</label>
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Fetching GitHub data..." : "Join Galaxy 🚀"}
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-600 text-center">
            Your public GitHub data is fetched once and stored in the galaxy. No authentication needed.
          </p>
        </div>
      </div>
    </main>
  );
}
