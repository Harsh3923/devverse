import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request, { params }) {
  const { slug } = await params;

  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("*")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  const { data: contributors, error: contribError } = await supabase
    .from("galaxy_contributors")
    .select("id, github_username, github_data, arm_index, arm_t, joined_at")
    .eq("galaxy_id", galaxy.id)
    .order("joined_at", { ascending: true });

  if (contribError) {
    return NextResponse.json({ error: contribError.message }, { status: 500 });
  }

  return NextResponse.json({ galaxy, contributors: contributors || [] });
}
