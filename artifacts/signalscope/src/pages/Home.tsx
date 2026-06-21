import SearchSong from "@/components/SearchSong";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero */}

      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          🎵 Built For Musicathon 2026
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-700 mt-8 text-5xl font-bold leading-tight md:text-7xl">
          Music Intelligence
          <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
            For Artists & Labels
          </span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto mt-6 max-w-3xl text-lg text-muted">
          Turn lyrics, metadata, and music signals into audience intelligence,
          cultural insights, and actionable growth recommendations.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          <div>
            <div className="text-2xl font-bold">50M+</div>
            <div className="text-sm text-muted">Tracks</div>
          </div>

          <div>
            <div className="text-2xl font-bold">AI</div>
            <div className="text-sm text-muted">Intelligence</div>
          </div>

          <div>
            <div className="text-2xl font-bold">100+</div>
            <div className="text-sm text-muted">Markets</div>
          </div>

          <div>
            <div className="text-2xl font-bold">Musicathon</div>
            <div className="text-sm text-muted">2026</div>
          </div>
        </div>
      </section>

      {/* Search */}

      <section className="mt-16">
        <SearchSong />
      </section>

      <div className="mx-auto my-20 h-px w-24 bg-border" />

      {/* How It Works */}

      <section className="mt-28">
        <h2 className="text-center text-3xl font-bold">How It Works</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Card
            title="Search A Song"
            description="Find any song from the music catalog."
          />

          <Card
            title="Analyze Signals"
            description="Process lyrics, metadata, and music context."
          />

          <Card
            title="Generate Intelligence"
            description="Discover audiences, positioning, and growth opportunities."
          />
        </div>
      </section>

      <div className="mx-auto my-20 h-px w-24 bg-border" />

      {/* Intelligence */}

      <section className="mt-28">
        <h2 className="text-center text-3xl font-bold">
          What You&apos;ll Discover
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Audience Archetypes"
            description="Identify who resonates with a song."
          />

          <Card
            title="Emotional Positioning"
            description="Understand the emotional signals driving engagement."
          />

          <Card
            title="Cultural Resonance"
            description="Measure identity, community, and lifestyle alignment."
          />

          <Card
            title="Content Opportunities"
            description="Find moments suitable for reels, shorts, and social content."
          />

          <Card
            title="Platform Fit"
            description="Determine where a song performs best."
          />

          <Card
            title="Growth Recommendations"
            description="Get actionable next steps for artists and marketers."
          />
        </div>
      </section>

      <div className="mx-auto my-20 h-px w-24 bg-border" />

      {/* Example */}

      <section className="mt-28">
        <h2 className="text-center text-3xl font-bold">Example Intelligence</h2>

        <div
          className="mx-auto mt-10 rounded-3xl border border-border bg-card/80 p-8 transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted">Song</p>

              <h3 className="mt-1 text-xl font-semibold">Enigma</h3>
            </div>

            <div>
              <p className="text-sm text-muted">Audience Archetype</p>

              <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300">
                Panjabi Diaspora
              </span>
            </div>

            <div>
              <p className="text-sm text-muted">Emotional Positioning</p>

              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                Confidence & Ambition
              </span>
            </div>

            <div>
              <p className="text-sm text-muted">Recommendation</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted">Platform Fit</p>

                  <p className="mt-1 font-medium">Instagram Reels 9.2/10</p>
                </div>

                <div>
                  <p className="text-sm text-muted">Audience Confidence</p>

                  <p className="mt-1 font-medium">92%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto my-20 h-px w-24 bg-border" />

      {/* Footer */}

      <section className="mt-28 border-t border-border py-10 text-center">
        <p className="text-sm text-muted">
          Built for Musicathon 2026 · Powered by Musixmatch
        </p>
      </section>
    </main>
  );
}
