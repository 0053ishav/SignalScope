import SearchSong from "@/components/SearchSong";

export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold">
        SignalScope
      </h1>

      <p className="mt-2 text-gray-500">
        AI Music Intelligence
      </p>

      <div className="mt-8">
        <SearchSong />
      </div>
    </main>
  );
}