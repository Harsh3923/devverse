export default async function GalaxyPage({ params }) {
  const { username } = await params;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4">
        🌌 {username}'s Galaxy
      </h1>

      <p className="text-gray-400">
        This is where the GitHub solar system will appear.
      </p>
    </main>
  );
}