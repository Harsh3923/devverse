import GalaxyScene from "@/components/GalaxyScene";
import { getGithubData } from "@/lib/github";

export default async function GalaxyPage({ params }) {
  const { username } = await params;
  const data = await getGithubData(username);

  const repos = data.repos || [];
  const user = data.user || {};

  return (
    <main className="min-h-screen text-white p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-3 text-4xl font-bold gradient-text animate-fade-in-up delay-0 md:text-5xl">
          🌌 {username}&apos;s Galaxy
        </h1>

        <p className="mb-8 animate-fade-in-up delay-1" style={{ color: "#94a3b8" }}>
          Explore this developer as a solar system of repositories.
        </p>

        <div className="mb-10 clay-card p-4 overflow-hidden animate-scale-in delay-2">
          <GalaxyScene repos={repos} user={user} />
        </div>

        <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Username", value: user.login || username },
            { label: "Public Repos", value: user.public_repos ?? 0 },
            { label: "Followers", value: user.followers ?? 0 },
            { label: "Following", value: user.following ?? 0 },
          ].map((stat, i) => (
            <div key={stat.label} className={`clay-stat p-4 animate-fade-in-up delay-${i + 2}`}>
              <p className="text-sm" style={{ color: "#94a3b8" }}>{stat.label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-white animate-fade-in-up delay-3">
          Planets (Repositories)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {repos.slice(0, 12).map((repo, i) => (
            <div
              key={repo.id}
              className={`clay-card clay-card-hover p-5 animate-fade-in-up delay-${Math.min(i, 6)}`}
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
