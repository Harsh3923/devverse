import GalaxyScene from "@/components/GalaxyScene";
import { getGithubData } from "@/lib/github";

export default async function GalaxyPage({ params }) {
  const { username } = await params;
  const data = await getGithubData(username);

  const repos = data.repos || [];
  const user = data.user || {};

  return (
    <main className="min-h-screen text-white p-8 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1
          className="mb-3 text-4xl font-bold md:text-5xl"
          style={{
            background: "linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          🌌 {username}&apos;s Galaxy
        </h1>

        <p className="mb-8" style={{ color: "#94a3b8" }}>
          Explore this developer as a solar system of repositories.
        </p>

        <div className="mb-10 clay-card p-4 overflow-hidden">
          <GalaxyScene repos={repos} user={user} />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="clay-stat p-4">
            <p className="text-sm" style={{ color: "#94a3b8" }}>Username</p>
            <p className="mt-2 text-lg font-semibold text-white">{user.login || username}</p>
          </div>

          <div className="clay-stat p-4">
            <p className="text-sm" style={{ color: "#94a3b8" }}>Public Repos</p>
            <p className="mt-2 text-lg font-semibold text-white">{user.public_repos ?? 0}</p>
          </div>

          <div className="clay-stat p-4">
            <p className="text-sm" style={{ color: "#94a3b8" }}>Followers</p>
            <p className="mt-2 text-lg font-semibold text-white">{user.followers ?? 0}</p>
          </div>

          <div className="clay-stat p-4">
            <p className="text-sm" style={{ color: "#94a3b8" }}>Following</p>
            <p className="mt-2 text-lg font-semibold text-white">{user.following ?? 0}</p>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-white">Planets (Repositories)</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.slice(0, 12).map((repo) => (
            <div
              key={repo.id}
              className="clay-card clay-card-hover p-5"
            >
              <h3 className="truncate text-lg font-semibold text-white">{repo.name}</h3>

              <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
                {repo.description || "No description available."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm" style={{ color: "#cbd5e1" }}>
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
