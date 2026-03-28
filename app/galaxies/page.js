import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getGalaxies() {
  try {
    const { data } = await supabase
      .from("galaxies")
      .select("id, name, slug, description, created_at")
      .order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

async function getContributorCounts() {
  try {
    const { data } = await supabase
      .from("galaxy_contributors")
      .select("galaxy_id");
    const counts = {};
    (data || []).forEach((r) => {
      counts[r.galaxy_id] = (counts[r.galaxy_id] || 0) + 1;
    });
    return counts;
  } catch { return {}; }
}

export default async function GalaxiesPage() {
  const [galaxies, counts] = await Promise.all([getGalaxies(), getContributorCounts()]);

  return (
    <main className="min-h-screen text-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4 animate-fade-in-up delay-0">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-sm transition-colors hover:text-slate-400"
              style={{ color: "#64748b" }}
            >
              ← Back to home
            </Link>
            <h1 className="text-4xl font-bold gradient-text">🌌 Galaxy Explorer</h1>
            <p className="mt-2" style={{ color: "#94a3b8" }}>Shared universes built by GitHub developers.</p>
          </div>
          <Link href="/galaxies/new" className="clay-btn-primary px-5 py-3 text-sm">
            + Create Galaxy
          </Link>
        </div>

        {galaxies.length === 0 ? (
          <div className="clay-card p-16 text-center animate-scale-in delay-1">
            <p className="text-5xl mb-4">🌠</p>
            <p className="text-xl font-semibold mb-2" style={{ color: "#cbd5e1" }}>No galaxies yet</p>
            <p className="mb-8" style={{ color: "#64748b" }}>Be the first to create a shared galaxy.</p>
            <Link href="/galaxies/new" className="clay-btn-primary px-6 py-3 text-sm inline-block">
              Create the first galaxy
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galaxies.map((g, i) => (
              <Link
                key={g.id}
                href={`/galaxies/${g.slug}`}
                className={`clay-card clay-card-hover p-6 block animate-fade-in-up delay-${Math.min(i, 6)}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">🌌</span>
                  <h2 className="text-lg font-bold truncate text-white">{g.name}</h2>
                </div>
                {g.description && (
                  <p className="mb-4 text-sm line-clamp-2" style={{ color: "#94a3b8" }}>{g.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm" style={{ color: "#64748b" }}>
                  <span>🪐 {counts[g.id] || 0} solar system{counts[g.id] !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{new Date(g.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
