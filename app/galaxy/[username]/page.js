import GalaxyScene from "@/components/GalaxyScene";
import { getGithubData } from "@/lib/github";

export default async function GalaxyPage({ params }) {
  const { username } = await params;
  const data = await getGithubData(username);

  const repos = data.repos || [];
  const user = data.user || {};

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-3 text-4xl font-bold md:text-5xl">
          🌌 {username}&apos;s Galaxy
        </h1>

        <p className="mb-8 text-gray-400">
          Explore this developer as a solar system of repositories.
        </p>

        <div className="mb-10 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 p-4">
          <GalaxyScene repos={repos} user={user} />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Username</p>
            <p className="mt-2 text-lg font-semibold">{user.login || username}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Public Repos</p>
            <p className="mt-2 text-lg font-semibold">{user.public_repos ?? 0}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Followers</p>
            <p className="mt-2 text-lg font-semibold">{user.followers ?? 0}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Following</p>
            <p className="mt-2 text-lg font-semibold">{user.following ?? 0}</p>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold">Planets (Repositories)</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.slice(0, 12).map((repo) => (
            <div
              key={repo.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <h3 className="truncate text-lg font-semibold">{repo.name}</h3>

              <p className="mt-2 text-sm text-gray-400">
                {repo.description || "No description available."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-300">
                <span>⭐ {repo.stargazers_count}</span>
                <span>🍴 {repo.forks_count}</span>
                <span>💻 {repo.language || "Unknown"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}