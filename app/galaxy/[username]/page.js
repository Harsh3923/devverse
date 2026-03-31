import GalaxyScene from "@/components/GalaxyScene";
import { getGithubData } from "@/lib/github";

export default async function GalaxyPage({ params }) {
  const { username } = await params;
  const data = await getGithubData(username);

  const repos = data.repos || [];
  const user = data.user || {};

  return (
    <main className="min-h-screen text-white p-4 sm:p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 flex items-center gap-3 text-2xl font-bold gradient-text animate-fade-in-up delay-0 sm:text-3xl md:text-4xl lg:text-5xl">
          <img src="/rocky.png" alt="Rocky" className="w-10 h-10 object-contain sm:w-12 sm:h-12 md:w-14 md:h-14" />
          {username}&apos;s Galaxy
        </h1>

        <p className="mb-6 text-sm animate-fade-in-up delay-1 sm:mb-8 sm:text-base" style={{ color: "#94a3b8" }}>
          Explore this developer as a solar system of repositories.
        </p>

        <div className="mb-6 clay-card p-2 overflow-hidden animate-scale-in delay-2 sm:mb-10 sm:p-4">
          <GalaxyScene repos={repos} user={user} />
        </div>

        {/* Stats — 2 cols on mobile, 4 on md+ */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-4">
          {[
            { label: "Username", value: user.login || username },
            { label: "Public Repos", value: user.public_repos ?? 0 },
            { label: "Followers", value: user.followers ?? 0 },
            { label: "Following", value: user.following ?? 0 },
          ].map((stat, i) => (
            <div key={stat.label} className={`clay-stat p-3 animate-fade-in-up delay-${i + 2} sm:p-4`}>
              <p className="text-xs sm:text-sm" style={{ color: "#94a3b8" }}>{stat.label}</p>
              <p className="mt-1 text-base font-semibold text-white truncate sm:mt-2 sm:text-lg">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-xl font-semibold text-white animate-fade-in-up delay-3 sm:mb-4 sm:text-2xl">
          Planets (Repositories)
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {repos.slice(0, 12).map((repo, i) => (
            <div
              key={repo.id}
              className={`clay-card clay-card-hover p-4 animate-fade-in-up delay-${Math.min(i, 6)} sm:p-5`}
            >
              <h3 className="truncate text-base font-semibold text-white sm:text-lg">{repo.name}</h3>
              <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm" style={{ color: "#94a3b8" }}>
                {repo.description || "No description available."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs sm:mt-4 sm:gap-3 sm:text-sm" style={{ color: "#cbd5e1" }}>
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
