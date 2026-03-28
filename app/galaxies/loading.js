export default function GalaxiesLoading() {
  return (
    <main className="min-h-screen text-white px-4 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header skeleton */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-10 w-56" />
            <div className="skeleton h-4 w-64" />
          </div>
          <div className="skeleton h-11 w-36 rounded-2xl" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card p-6 flex flex-col gap-3" style={{ minHeight: 140 }}>
              <div className="flex items-center gap-3">
                <div className="skeleton h-8 w-8 rounded-full" />
                <div className="skeleton h-5 w-32" />
              </div>
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-40 mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
