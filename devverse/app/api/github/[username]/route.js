import { getGithubData } from "@/lib/github";

export async function GET(req, { params }) {
  const { username } = await params;

  const data = await getGithubData(username);

  return Response.json(data);
}