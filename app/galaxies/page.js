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
    <main className="min-h-screen text-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 animate-fade-in-up delay-0">
          <div>
            <Link
              href="/"
              className="back-link mb-2 inline-flex items-center gap-2 text-sm transition-colors hover:text-slate-400"
              style={{ color: "#64748b" }}
            >
              ← Back to home
            </Link>
            <h1 className="text-3xl font-bold gradient-text sm:text-4xl">🌌 Galaxy Explorer</h1>
            <p className="mt-1 text-sm sm:mt-2 sm:text-base" style={{ color: "#94a3b8" }}>
              Shared universes built by GitHub developers.
            </p>
          </div>
          <Link
            href="/galaxies/new"
            className="clay-btn-primary px-5 py-3 text-sm w-full text-center sm:w-auto"
          >
            + Create Galaxy
          </Link>
        </div>

        {galaxies.length === 0 ? (
          <div className="clay-card p-10 text-center animate-scale-in delay-1 sm:p-16">
            <p className="text-4xl mb-4 sm:text-5xl">🌠</p>
            <p className="text-lg font-semibold mb-2 sm:text-xl" style={{ color: "#cbd5e1" }}>No galaxies yet</p>
            <p className="mb-6 text-sm sm:mb-8 sm:text-base" style={{ color: "#64748b" }}>Be the first to create a shared galaxy.</p>
            <Link href="/galaxies/new" className="clay-btn-primary px-6 py-3 text-sm inline-block">
              Create the first galaxy
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {galaxies.map((g, i) => (
              <Link
                key={g.id}
                href={`/galaxies/${g.slug}`}
                className={`clay-card clay-card-hover p-5 block animate-fade-in-up delay-${Math.min(i, 6)}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xl sm:text-2xl">🌌</span>
                  <h2 className="text-base font-bold truncate text-white sm:text-lg">{g.name}</h2>
                </div>
                {g.description && (
                  <p className="mb-3 text-sm line-clamp-2 sm:mb-4" style={{ color: "#94a3b8" }}>{g.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs sm:gap-4 sm:text-sm" style={{ color: "#64748b" }}>
                  <span>🪐 {counts[g.id] || 0} system{counts[g.id] !== 1 ? "s" : ""}</span>
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
