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
    <main className="min-h-screen text-white">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <h1 className="text-6xl font-bold mb-4" style={{
          background: "linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Code Galaxy 🌌
        </h1>
        <p className="max-w-xl text-lg" style={{ color: "#94a3b8" }}>
          Visualize GitHub developers as solar systems — explore solo or build shared galaxies with others.
        </p>
      </div>

      {/* Two-card layout */}
      <div className="mx-auto max-w-5xl px-6 pb-16 grid gap-6 md:grid-cols-2">

        {/* Card 1: Solo Explorer */}
        <div className="clay-card p-8 flex flex-col">
          <div className="mb-6">
            <span className="text-4xl">🔭</span>
            <h2 className="mt-3 text-2xl font-bold text-white">Solo Explorer</h2>
            <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
              Enter any GitHub username to visualize their repositories as a private solar system.
            </p>
          </div>
          <div className="mt-auto">
            <SoloExplorer />
          </div>
        </div>

        {/* Card 2: Shared Galaxies */}
        <div className="clay-card p-8 flex flex-col">
          <div className="mb-6">
            <span className="text-4xl">🌌</span>
            <h2 className="mt-3 text-2xl font-bold text-white">Shared Galaxies</h2>
            <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
              Create a named galaxy, invite developers to add their solar systems, and explore together in real-time.
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <Link
              href="/galaxies"
              className="clay-btn-ghost w-full text-center px-6 py-3 text-sm inline-block"
            >
              Browse Galaxies
            </Link>
            <Link
              href="/galaxies/new"
              className="clay-btn-primary w-full text-center px-6 py-3 text-sm inline-block"
            >
              + Create a Galaxy
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Galaxies Strip */}
      {recentGalaxies.length > 0 && (
        <div className="mx-auto max-w-5xl px-6 pb-20">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#64748b" }}>
              Recent Galaxies
            </h3>
            <Link
              href="/galaxies"
              className="text-sm font-medium transition-colors"
              style={{ color: "#818cf8" }}
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {recentGalaxies.map((g) => (
              <Link
                key={g.id}
                href={`/galaxies/${g.slug}`}
                className="clay-card clay-card-hover p-5 block"
              >
                <p className="font-semibold truncate text-white">{g.name}</p>
                <p className="mt-1 text-xs" style={{ color: "#64748b" }}>
                  🪐 {g.contributors} solar system{g.contributors !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
