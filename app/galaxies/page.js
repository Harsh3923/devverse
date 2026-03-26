import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Link href="/" className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              ← Back to home
            </Link>
            <h1 className="text-4xl font-bold">🌌 Galaxy Explorer</h1>
            <p className="mt-2 text-gray-400">Shared universes built by GitHub developers.</p>
          </div>
          <Link
            href="/galaxies/new"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 transition-colors"
          >
            + Create Galaxy
          </Link>
        </div>

        {galaxies.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-16 text-center">
            <p className="text-5xl mb-4">🌠</p>
            <p className="text-xl font-semibold text-gray-300 mb-2">No galaxies yet</p>
            <p className="text-gray-500 mb-6">Be the first to create a shared galaxy.</p>
            <Link href="/galaxies/new" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors">
              Create the first galaxy
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galaxies.map((g) => (
              <Link
                key={g.id}
                href={`/galaxies/${g.slug}`}
                className="group rounded-2xl border border-gray-800 bg-gray-950 p-6 hover:border-blue-800 hover:bg-gray-900 transition-all"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">🌌</span>
                  <h2 className="text-lg font-bold truncate group-hover:text-blue-400 transition-colors">{g.name}</h2>
                </div>
                {g.description && (
                  <p className="mb-4 text-sm text-gray-400 line-clamp-2">{g.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
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
