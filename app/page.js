import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SoloExplorer from "./SoloExplorer";

async function getRecentGalaxies() {
  try {
    const { data } = await supabase
      .from("galaxies")
      .select("id, name, slug, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!data) return [];

    // Get contributor counts
    const ids = data.map((g) => g.id);
    const { data: contribs } = await supabase
      .from("galaxy_contributors")
      .select("galaxy_id")
      .in("galaxy_id", ids);

    const counts = {};
    (contribs || []).forEach((r) => { counts[r.galaxy_id] = (counts[r.galaxy_id] || 0) + 1; });

    return data.map((g) => ({ ...g, contributors: counts[g.id] || 0 }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const recentGalaxies = await getRecentGalaxies();

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <h1 className="text-6xl font-bold mb-4">
          Code Galaxy 🌌
        </h1>
        <p className="text-gray-400 max-w-xl text-lg">
          Visualize GitHub developers as solar systems — explore solo or build shared galaxies with others.
        </p>
      </div>

      {/* Two-card layout */}
      <div className="mx-auto max-w-5xl px-6 pb-16 grid gap-6 md:grid-cols-2">

        {/* Card 1: Solo Explorer */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 flex flex-col">
          <div className="mb-6">
            <span className="text-4xl">🔭</span>
            <h2 className="mt-3 text-2xl font-bold">Solo Explorer</h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter any GitHub username to visualize their repositories as a private solar system.
            </p>
          </div>
          <div className="mt-auto">
            <SoloExplorer />
          </div>
        </div>

        {/* Card 2: Shared Galaxies */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 flex flex-col">
          <div className="mb-6">
            <span className="text-4xl">🌌</span>
            <h2 className="mt-3 text-2xl font-bold">Shared Galaxies</h2>
            <p className="mt-2 text-sm text-gray-400">
              Create a named galaxy, invite developers to add their solar systems, and explore together in real-time.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <Link
              href="/galaxies"
              className="w-full text-center rounded-xl bg-gray-800 border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-700 transition-colors"
            >
              Browse Galaxies
            </Link>
            <Link
              href="/galaxies/new"
              className="w-full text-center rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors"
            >
              + Create a Galaxy
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Galaxies Strip */}
      {recentGalaxies.length > 0 && (
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Recent Galaxies</h3>
            <Link href="/galaxies" className="text-sm text-blue-500 hover:text-blue-400 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentGalaxies.map((g) => (
              <Link
                key={g.id}
                href={`/galaxies/${g.slug}`}
                className="rounded-xl border border-gray-800 bg-gray-950 p-4 hover:border-gray-700 hover:bg-gray-900 transition-all"
              >
                <p className="font-semibold truncate">{g.name}</p>
                <p className="mt-1 text-xs text-gray-500">🪐 {g.contributors} solar system{g.contributors !== 1 ? "s" : ""}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
