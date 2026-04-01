import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGithubData } from "@/lib/github";

export async function POST(_request, { params }) {
  const { slug } = await params;

  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  const { data: contributors, error: contribError } = await supabase
    .from("galaxy_contributors")
    .select("id, github_username")
    .eq("galaxy_id", galaxy.id);

  if (contribError || !contributors?.length) {
    return NextResponse.json({ refreshed: 0 });
  }

  // Re-fetch GitHub data for each contributor in parallel
  const updates = await Promise.all(
    contributors.map(async (c) => {
      const githubData = await getGithubData(c.github_username);
      return supabaseAdmin
        .from("galaxy_contributors")
        .update({ github_data: githubData })
        .eq("id", c.id);
    })
  );

  const failed = updates.filter(({ error }) => error).length;
  return NextResponse.json({ refreshed: contributors.length - failed, failed });
}
