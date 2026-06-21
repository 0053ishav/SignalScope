import SearchSong from "@/components/SearchSong";
import { Link } from "wouter";
import { BrainCircuit, Layers, Activity, Zap, TrendingUp, Globe, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 lg:px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))]" />
        
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-8">
            <BrainCircuit className="w-4 h-4" />
            AI-Powered Music Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Decide with Data. <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Grow with Intelligence.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            SignalScope transforms raw lyrics, RichSync timelines, and semantic metadata into enterprise-grade audience intelligence for artists and labels.
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchSong />
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 px-6 lg:px-8 bg-card/30 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight">The Intelligence Platform</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Everything you need to understand who your music is for, why it resonates, and where it will spread best.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Layers}
              title="Audience Archetypes"
              desc="Identify precise listener segments based on semantic content and mood positioning."
            />
            <FeatureCard 
              icon={Activity}
              title="Emotional Resonance"
              desc="Map the emotional territory your track occupies and how to leverage it."
            />
            <FeatureCard 
              icon={Globe}
              title="Cultural Signals"
              desc="Understand the communities and identity groups your music naturally aligns with."
            />
            <FeatureCard 
              icon={Zap}
              title="Virality Mechanics"
              desc="Pinpoint the exact hooks and moments driving algorithmic spread."
            />
            <FeatureCard 
              icon={TrendingUp}
              title="Distribution Strategy"
              desc="Get calculated platform fit scores across TikTok, Reels, Shorts, and Playlists."
            />
            <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col justify-center items-center text-center">
              <BrainCircuit className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-primary">Gemini 2.5 Flash</h3>
              <p className="text-sm text-primary/80">Powered by advanced LLM reasoning over Musixmatch metadata.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 text-center border-t border-border mt-auto">
        <p className="text-sm text-muted-foreground">
          Built for Musicathon 2026 · Powered by Musixmatch
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-2xl border border-border bg-card hover:bg-secondary/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 border border-border">
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}