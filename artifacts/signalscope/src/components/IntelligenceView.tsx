import { TrackDetails, LyricsResponse, AnalysisResponse, LyricSegment } from "@/types/music";
import { IntelligenceReport } from "@/types/intelligence";
import { useEffect, useState, useRef } from "react";
import { Loader2, AlertCircle, RefreshCw, BarChart3, PieChart, Activity, Download, BrainCircuit, Lightbulb, Zap, Crosshair, Globe, Layers, TrendingUp } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Pie, Cell } from "recharts";

interface Props {
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  richSync: unknown;
  analysis: AnalysisResponse | null;
  activeSection: string;
}

export default function IntelligenceView({ track, lyrics, richSync, analysis, activeSection }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<IntelligenceReport | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  async function generate() {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("/api/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track, lyrics, richSync, analysis }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate intelligence");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!report && !loading && !error) {
      generate();
    }
  }, [track.commontrack_id]);

  useEffect(() => {
    if (activeSection && report) {
      const el = document.getElementById(`section-${activeSection}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [activeSection, report]);

  if (loading || (!report && !error)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="w-16 h-16 relative mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <BrainCircuit className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Synthesizing Intelligence</h2>
        <p className="text-muted-foreground max-w-md">
          Analyzing semantic meaning, semantic metadata, cultural resonance, and platform mechanics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Processing Failed</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button 
          onClick={generate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!report) return null;

  const radarData = [
    { subject: "Audience", A: report.scores.audience, fullMark: 100 },
    { subject: "Emotion", A: report.scores.emotion, fullMark: 100 },
    { subject: "Virality", A: report.scores.virality, fullMark: 100 },
    { subject: "Growth", A: report.scores.growth, fullMark: 100 },
  ];

  const distributionData = [
    { name: "Archetypes", value: report.audienceArchetypes.length },
    { name: "Emotions", value: report.emotionalPositioning.length },
    { name: "Cultural", value: report.culturalPositioning.length },
    { name: "Viral", value: report.viralDrivers.length }
  ].filter(d => d.value > 0);
  
  const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  const platformScores = report.platformFit.map(p => ({
    name: p.platform,
    score: p.score === "High" ? 90 : p.score === "Medium" ? 60 : 30
  }));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={containerRef}>
      
      {/* Workspace Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">{track.track_name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              {track.artist_name}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Confidence {report.confidence}%
            </span>
            <span className="text-xs text-muted-foreground">
              Gemini 2.5 Flash
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={generate} className="p-2 rounded-md hover:bg-secondary text-muted-foreground transition-colors" title="Regenerate">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-16">
        
        {/* Executive Briefing */}
        <section id="section-executive" className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-primary mb-4">
              <BrainCircuit className="w-5 h-5" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">Executive Briefing</h2>
            </div>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground">
              {report.summary}
            </p>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Audience Score" value={report.scores.audience} icon={Layers} trend="Strong identity" color="text-blue-400" />
          <KpiCard title="Emotion Score" value={report.scores.emotion} icon={Activity} trend="Deep resonance" color="text-pink-400" />
          <KpiCard title="Virality Score" value={report.scores.virality} icon={Zap} trend="High spread" color="text-amber-400" />
          <KpiCard title="Growth Score" value={report.scores.growth} icon={TrendingUp} trend="Scale potential" color="text-emerald-400" />
        </section>

        <div className="h-px bg-border" />

        {/* Audience Intelligence */}
        <section id="section-audience" className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Audience Intelligence</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Archetypes</h3>
              {report.audienceArchetypes.map(a => (
                <div key={a} className="p-4 rounded-xl border border-border bg-card">
                  <h4 className="font-semibold text-foreground">{a}</h4>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Evidence</h3>
              {report.evidence.audience.map(e => (
                <div key={e} className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm text-foreground">
                  {e}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emotional Analysis */}
        <section id="section-emotion" className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Emotional Analysis</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="h-64 rounded-xl border border-border bg-card p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {report.emotionalPositioning.map(e => (
                  <span key={e} className="px-3 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-400 text-sm font-medium">
                    {e}
                  </span>
                ))}
              </div>
              <div className="space-y-2 mt-4">
                {report.evidence.emotion.map((e, i) => (
                  <div key={i} className="text-sm text-muted-foreground border-l-2 border-pink-500/50 pl-3 py-1">
                    {e}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cultural Signals */}
        <section id="section-cultural" className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Cultural Signals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {report.culturalPositioning.map((c, i) => (
              <div key={i} className="p-5 rounded-xl border border-border bg-card hover:border-cyan-500/30 transition-colors">
                <Globe className="w-5 h-5 text-cyan-400 mb-3" />
                <h4 className="font-semibold">{c}</h4>
              </div>
            ))}
          </div>
        </section>

        {/* Virality & Content */}
        <section id="section-virality" className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Virality & Content</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Viral Drivers</h3>
              <ul className="space-y-3">
                {report.viralDrivers.map((v, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Content Opportunities</h3>
              <ul className="space-y-3">
                {report.contentOpportunities.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="h-px bg-border" />

        {/* Strategy & Growth */}
        <section id="section-growth" className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Growth & Strategy</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recommendations */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recommendations</h3>
              {report.growthRecommendations.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm">{r}</span>
                </div>
              ))}
            </div>

            {/* Distribution */}
            <div id="section-distribution" className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Distribution Fit</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformScores} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {report.platformFit.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="font-medium">{p.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.score === "High" ? "bg-emerald-500/10 text-emerald-400" :
                      p.score === "Medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {p.score} Fit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section id="section-actions" className="space-y-6 pb-20">
          <h2 className="text-2xl font-bold tracking-tight">Artist Action Plan</h2>
          <div className="grid gap-3">
            {report.artistActions.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{i + 1}</span>
                </div>
                <span className="font-medium text-sm md:text-base">{a}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{trend}</p>
    </div>
  );
}