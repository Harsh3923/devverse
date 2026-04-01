import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

async function getGalaxies() {
  try {
    const { data } = await supabase
      .from("galaxies")
      .select("id, name, slug, description, created_at, created_by")
      .order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

async function getContributorCounts() {
  try {
    const { data } = await supabase.from("galaxy_contributors").select("galaxy_id");
    const counts = {};
    (data || []).forEach((r) => { counts[r.galaxy_id] = (counts[r.galaxy_id] || 0) + 1; });
    return counts;
  } catch { return {}; }
}

async function getMyGalaxies(login) {
  try {
    const { data } = await supabase
      .from("galaxies")
      .select("id, name, slug, created_at")
      .eq("created_by", login)
      .order("created_at", { ascending: false });
    return data || [];
  } catch { return []; }
}

async function getJoinedGalaxies(login) {
  try {
    const { data } = await supabase
      .from("galaxy_contributors")
      .select("galaxies(id, name, slug, created_at, created_by)")
      .eq("github_username", login.toLowerCase());
    return (data || [])
      .map(c => c.galaxies)
      .filter(g => g && g.created_by?.toLowerCase() !== login.toLowerCase());
  } catch { return []; }
}

function SidebarGalaxyItem({ g }) {
  return (
    <Link
      href={`/galaxies/${g.slug}`}
      className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: "rgba(34,197,94,0.04)",
        border: "1px solid rgba(34,197,94,0.08)",
        color: "#d1fae5",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.09)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.04)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.08)"; }}
    >
      <span className="text-sm">🌌</span>
      <span className="truncate text-xs font-medium">{g.name}</span>
    </Link>
  );
}

export default async function GalaxiesPage() {
  const [galaxies, counts, session] = await Promise.all([
    getGalaxies(),
    getContributorCounts(),
    getServerSession(authOptions),
  ]);

  const login = session?.githubLogin ?? null;

  const [myGalaxies, joinedGalaxies] = login
    ? await Promise.all([getMyGalaxies(login), getJoinedGalaxies(login)])
    : [[], []];

  return (
    <main className="min-h-screen text-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0 animate-fade-in-up delay-0">
          <div>
            <Link href="/" className="back-link mb-2 inline-flex items-center gap-2 text-sm transition-colors hover:text-slate-400" style={{ color: "#64748b" }}>
              ← Back to home
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold gradient-text sm:text-4xl">
              <img src="/crimson-space.png" alt="" className="w-10 h-10 object-cover rounded-lg sm:w-12 sm:h-12" />
              Galaxy Explorer
            </h1>
            <p className="mt-1 text-sm sm:mt-2 sm:text-base" style={{ color: "#94a3b8" }}>
              Shared universes built by GitHub developers.
            </p>
          </div>
          <Link href="/galaxies/new" className="clay-btn-primary px-5 py-3 text-sm w-full text-center sm:w-auto">
            + Create Galaxy
          </Link>
        </div>

        {/* 70 / 30 split on large screens, stacked on mobile */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">

          {/* ── Left 70% — all galaxies ── */}
          <div className="w-full lg:w-[70%]">
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
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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

          {/* ── Right 30% — personal sidebar ── */}
          <div className="w-full lg:w-[30%] flex flex-col gap-4">

            {!login ? (
              /* Not signed in */
              <div className="clay-card p-5 text-center" style={{ borderTop: "2px solid rgba(34,197,94,0.2)" }}>
                <p className="text-2xl mb-3">🔭</p>
                <p className="text-sm font-semibold mb-1 text-white">Your Galaxy Dashboard</p>
                <p className="text-xs mb-4" style={{ color: "#64748b" }}>
                  Sign in to see the galaxies you created and joined.
                </p>
                <a
                  href="/api/auth/signin/github"
                  className="clay-btn-primary px-4 py-2 text-xs inline-block"
                >
                  Sign in with GitHub
                </a>
              </div>
            ) : (
              <>
                {/* Galaxies I created */}
                <div className="clay-card p-4" style={{ borderTop: "2px solid rgba(34,197,94,0.3)" }}>
                  <h3 className="mb-3 text-sm font-bold" style={{ color: "#4ade80" }}>
                    🌌 Galaxies I Created
                  </h3>
                  {myGalaxies.length === 0 ? (
                    <p className="text-xs" style={{ color: "#4b7a5a" }}>
                      You haven&apos;t created any galaxies yet.{" "}
                      <Link href="/galaxies/new" style={{ color: "#4ade80" }}>Create one →</Link>
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {myGalaxies.map(g => <SidebarGalaxyItem key={g.id} g={g} />)}
                    </div>
                  )}
                </div>

                {/* Galaxies I joined */}
                <div className="clay-card p-4" style={{ borderTop: "2px solid rgba(185,28,28,0.3)" }}>
                  <h3 className="mb-3 text-sm font-bold" style={{ color: "#fca5a5" }}>
                    🪐 Galaxies I Joined
                  </h3>
                  {joinedGalaxies.length === 0 ? (
                    <p className="text-xs" style={{ color: "#4b7a5a" }}>
                      You haven&apos;t joined any galaxies yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {joinedGalaxies.map(g => <SidebarGalaxyItem key={g.id} g={g} />)}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
