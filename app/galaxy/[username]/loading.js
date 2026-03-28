export default function GalaxyLoading() {
  return (
    <main className="min-h-screen text-white p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Title skeleton */}
        <div className="mb-3 skeleton h-12 w-72 md:w-96" />
        <div className="mb-8 skeleton h-4 w-64" />

        {/* 3D scene skeleton */}
        <div className="mb-10 skeleton-card overflow-hidden" style={{ height: 420 }}>
          <div className="w-full h-full flex items-center justify-center">
            <div className="skeleton h-8 w-40" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-8 grid gap-4 grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card p-4 flex flex-col gap-2">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Repos title skeleton */}
        <div className="mb-4 skeleton h-8 w-52" />

        {/* Repo cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card p-5 flex flex-col gap-3" style={{ minHeight: 130 }}>
              <div className="skeleton h-5 w-36" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="flex gap-3 mt-auto">
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
