import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getGithubData } from "@/lib/github";

const MAX_SLOTS_PER_ARM = 20; // supports up to 100 contributors (5 arms × 20 slots)

export async function POST(request, { params }) {
  const { slug } = await params;

  // Verify the user is authenticated via GitHub OAuth
  const session = await getServerSession(authOptions);
  if (!session?.githubLogin) {
    return NextResponse.json({ error: "You must sign in with GitHub to join a galaxy" }, { status: 401 });
  }

  const body = await request.json();
  const { github_username } = body;

  // Ensure the submitted username matches the authenticated GitHub account
  if (!github_username?.trim() || github_username.trim().toLowerCase() !== session.githubLogin.toLowerCase()) {
    return NextResponse.json({ error: "You can only add your own GitHub account" }, { status: 403 });
  }

  // Resolve galaxy
  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("galaxy_contributors")
    .select("id")
    .eq("galaxy_id", galaxy.id)
    .eq("github_username", github_username.trim().toLowerCase())
    .single();

  if (existing) {
    return NextResponse.json({ error: "This GitHub user has already joined this galaxy" }, { status: 409 });
  }

  // Fetch GitHub data (cached once)
  const githubData = await getGithubData(github_username.trim());
  if (!githubData.user || githubData.user.message === "Not Found") {
    return NextResponse.json({ error: "GitHub user not found" }, { status: 404 });
  }

  // Count existing contributors to assign arm position
  const { count } = await supabase
    .from("galaxy_contributors")
    .select("id", { count: "exact", head: true })
    .eq("galaxy_id", galaxy.id);

  const existingCount = count ?? 0;
  const arm_index = existingCount % 5;
  const arm_t_slot = Math.floor(existingCount / 5);
  const arm_t = 0.35 + (arm_t_slot / MAX_SLOTS_PER_ARM) * 0.65;

  // Insert contributor with cached GitHub data
  const { data: contributor, error: insertError } = await supabase
    .from("galaxy_contributors")
    .insert({
      galaxy_id: galaxy.id,
      github_username: github_username.trim().toLowerCase(),
      github_data: githubData,
      arm_index,
      arm_t,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(contributor, { status: 201 });
}

export async function DELETE(_request, { params }) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.githubLogin) {
    return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  }

  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("id")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("galaxy_contributors")
    .delete()
    .eq("galaxy_id", galaxy.id)
    .eq("github_username", session.githubLogin.toLowerCase());

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
