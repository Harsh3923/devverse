import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_request, { params }) {
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

export async function PATCH(request, { params }) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.githubLogin) {
    return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  }

  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("id, created_by")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  if (galaxy.created_by?.toLowerCase() !== session.githubLogin.toLowerCase()) {
    return NextResponse.json({ error: "Only the creator can edit this galaxy" }, { status: 403 });
  }

  const body = await request.json();
  const name = body.name?.trim();
  const description = body.description?.trim() ?? "";

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (name.length > 60) return NextResponse.json({ error: "Name must be 60 characters or fewer" }, { status: 400 });
  if (description.length > 200) return NextResponse.json({ error: "Description must be 200 characters or fewer" }, { status: 400 });

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("galaxies")
    .update({ name, description })
    .eq("id", galaxy.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.githubLogin) {
    return NextResponse.json({ error: "You must be signed in" }, { status: 401 });
  }

  const { data: galaxy, error: galaxyError } = await supabase
    .from("galaxies")
    .select("id, created_by")
    .eq("slug", slug)
    .single();

  if (galaxyError || !galaxy) {
    return NextResponse.json({ error: "Galaxy not found" }, { status: 404 });
  }

  if (!galaxy.created_by || galaxy.created_by.toLowerCase() !== session.githubLogin.toLowerCase()) {
    return NextResponse.json({ error: "Only the creator can delete this galaxy" }, { status: 403 });
  }

  const { error: deleteContribError } = await supabaseAdmin
    .from("galaxy_contributors")
    .delete()
    .eq("galaxy_id", galaxy.id);

  if (deleteContribError) {
    return NextResponse.json({ error: deleteContribError.message }, { status: 500 });
  }

  const { error: deleteGalaxyError } = await supabaseAdmin
    .from("galaxies")
    .delete()
    .eq("id", galaxy.id);

  if (deleteGalaxyError) {
    return NextResponse.json({ error: deleteGalaxyError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
