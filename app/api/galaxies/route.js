import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const { data, error } = await supabase
    .from("galaxies")
    .select("id, name, slug, description, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.githubLogin) {
    return NextResponse.json({ error: "You must sign in with GitHub to create a galaxy" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description = "" } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.trim().length > 60) {
    return NextResponse.json({ error: "Name must be 60 characters or fewer" }, { status: 400 });
  }
  if (description.length > 200) {
    return NextResponse.json({ error: "Description must be 200 characters or fewer" }, { status: 400 });
  }

  const slug = slugify(name);
  if (!slug) {
    return NextResponse.json({ error: "Invalid galaxy name" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("galaxies")
    .insert({ name: name.trim(), slug, description: description.trim(), created_by: session.githubLogin })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A galaxy with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
