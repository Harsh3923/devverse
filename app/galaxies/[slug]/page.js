import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";
import SharedGalaxyView from "@/components/SharedGalaxyView";
import CopyLinkButton from "./CopyLinkButton";
import DeleteGalaxyButton from "./DeleteGalaxyButton";

async function getGalaxyData(slug) {
  const { data: galaxy } = await supabase
    .from("galaxies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!galaxy) return null;

  const { data: contributors } = await supabase
    .from("galaxy_contributors")
    .select("id, github_username, github_data, arm_index, arm_t, joined_at")
    .eq("galaxy_id", galaxy.id)
    .order("joined_at", { ascending: true });

  return { galaxy, contributors: contributors || [] };
}

export default async function GalaxySlugPage({ params }) {
  const { slug } = await params;
  const [result, session] = await Promise.all([getGalaxyData(slug), getServerSession(authOptions)]);
  if (!result) notFound();

  const { galaxy, contributors } = result;
  const isOwner = session?.githubLogin?.toLowerCase() === galaxy.created_by?.toLowerCase();

  return (
    <main className="min-h-screen text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/galaxies"
              className="mb-2 inline-flex items-center gap-2 text-sm transition-colors"
              style={{ color: "#64748b" }}
            >
              ← All galaxies
            </Link>
            <h1 className="text-4xl font-bold text-white">🌌 {galaxy.name}</h1>
            {galaxy.description && (
              <p className="mt-2" style={{ color: "#94a3b8" }}>{galaxy.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <CopyLinkButton slug={slug} />
            <Link
              href={`/galaxies/${slug}/contribute`}
              className="clay-btn-primary px-5 py-2.5 text-sm"
            >
              + Add my solar system
            </Link>
            {isOwner && <DeleteGalaxyButton slug={slug} />}
          </div>
        </div>

        {/* 3D Scene */}
        <div className="mb-8 clay-card p-4 overflow-hidden">
          <SharedGalaxyView initialContributors={contributors} galaxyId={galaxy.id} />
        </div>

        {/* Contributors list */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            🪐 {contributors.length} Solar System{contributors.length !== 1 ? "s" : ""}
          </h2>
          {contributors.length === 0 ? (
            <div className="clay-card p-10 text-center">
              <p className="mb-4" style={{ color: "#94a3b8" }}>No solar systems yet. Be the first to contribute!</p>
              <Link
                href={`/galaxies/${slug}/contribute`}
                className="clay-btn-primary px-5 py-2.5 text-sm inline-block"
              >
                Add your solar system
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {contributors.map((c) => {
                const user = c.github_data?.user || {};
                return (
                  <a
                    key={c.id}
                    href={`https://github.com/${c.github_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-card clay-card-hover flex items-center gap-3 p-4"
                  >
                    {user.avatar_url && (
                      <img src={user.avatar_url} alt={c.github_username} className="h-10 w-10 rounded-full" />
                    )}
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate text-white">@{c.github_username}</p>
                      <p className="text-xs" style={{ color: "#64748b" }}>{(c.github_data?.repos || []).length} repos</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
