import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SharedGalaxyView from "@/components/SharedGalaxyView";
import CopyLinkButton from "./CopyLinkButton";

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
  const result = await getGalaxyData(slug);
  if (!result) notFound();

  const { galaxy, contributors } = result;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/galaxies" className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors">
              ← All galaxies
            </Link>
            <h1 className="text-4xl font-bold">🌌 {galaxy.name}</h1>
            {galaxy.description && (
              <p className="mt-2 text-gray-400">{galaxy.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <CopyLinkButton slug={slug} />
            <Link
              href={`/galaxies/${slug}/contribute`}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-500 transition-colors text-sm"
            >
              + Add my solar system
            </Link>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="mb-8">
          <SharedGalaxyView initialContributors={contributors} galaxyId={galaxy.id} />
        </div>

        {/* Contributors list */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">
            🪐 {contributors.length} Solar System{contributors.length !== 1 ? "s" : ""}
          </h2>
          {contributors.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
              <p className="text-gray-400 mb-4">No solar systems yet. Be the first to contribute!</p>
              <Link href={`/galaxies/${slug}/contribute`} className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold hover:bg-blue-500 transition-colors text-sm">
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
                    className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4 hover:border-gray-600 hover:bg-gray-900 transition-all"
                  >
                    {user.avatar_url && (
                      <img src={user.avatar_url} alt={c.github_username} className="h-10 w-10 rounded-full" />
                    )}
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate">@{c.github_username}</p>
                      <p className="text-xs text-gray-500">{(c.github_data?.repos || []).length} repos</p>
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
