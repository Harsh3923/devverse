export default function HomeLoading() {
  return (
    <main className="min-h-screen text-white">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-14 text-center gap-4">
        <div className="skeleton h-14 w-48 md:w-64" />
        <div className="skeleton h-5 w-72 md:w-96" />
        <div className="skeleton h-4 w-52" />
      </div>

      {/* Two cards skeleton */}
      <div className="mx-auto max-w-5xl px-4 pb-16 grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton-card p-7 flex flex-col gap-4" style={{ minHeight: 220 }}>
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-3/4 mt-auto" />
          </div>
        ))}
      </div>
    </main>
  );
}
