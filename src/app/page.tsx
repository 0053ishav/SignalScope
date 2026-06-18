import SearchSong from "@/components/SearchSong";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-16">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-violet-500/30
            bg-violet-500/10
            px-4
            py-2
            text-sm
            text-violet-300
          "
        >
          🎵 Music Intelligence Platform
        </div>

        <h1 className="mt-6 text-6xl font-bold leading-tight">
          Turn Songs Into
          <span
            className="
              block
              bg-gradient-to-r
              from-violet-400
              to-blue-400
              bg-clip-text
              text-transparent
            "
          >
            Audience Intelligence
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-muted">
          Understand who resonates with a song,
          why it spreads, and what actions artists,
          marketers, and labels should take next.
        </p>
      </div>

      <SearchSong />
    </main>
  );
}