"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function ContributePage() {
  const router = useRouter();
  const { slug } = useParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.githubLogin) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/galaxies/${slug}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ github_username: session.githubLogin }),
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
        <Link
          href={`/galaxies/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back to galaxy
        </Link>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8">
          <h1 className="text-3xl font-bold mb-2">🪐 Add Your Solar System</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Sign in with GitHub to verify your identity. Your repositories will become planets orbiting your star in this galaxy.
          </p>

          {status === "loading" && (
            <div className="text-center text-gray-500 py-6">Loading...</div>
          )}

          {status === "unauthenticated" && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => signIn("github")}
                className="flex items-center justify-center gap-3 rounded-xl bg-gray-800 border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-700 transition-colors"
              >
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Sign in with GitHub
              </button>
              <p className="text-xs text-gray-600 text-center">
                We verify your identity so only you can add your solar system.
              </p>
            </div>
          )}

          {status === "authenticated" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="rounded-xl bg-gray-900 border border-gray-700 px-4 py-3 flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.githubLogin}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold">{session.githubLogin}</p>
                  <p className="text-xs text-gray-500">Signed in with GitHub</p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Fetching GitHub data..." : "Join Galaxy 🚀"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
