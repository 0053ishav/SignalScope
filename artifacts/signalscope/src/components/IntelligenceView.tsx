import { TrackDetails, LyricsResponse, AnalysisResponse } from "@/types/music";
import { IntelligenceReport } from "@/types/intelligence";
import { useEffect, useState, useRef, useMemo, ReactNode } from "react";
import {
  AlertCircle,
  RefreshCw,
  BrainCircuit,
  Lightbulb,
  Zap,
  Globe,
  Layers,
  TrendingUp,
  Activity,
  ShieldCheck,
  Target,
  Quote,
  Sparkles,
  Share2,
  ListChecks,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  RadialBar,
  RadialBarChart,
} from "recharts";

interface Props {
  track: TrackDetails;
  lyrics: LyricsResponse | null;
  richSync: unknown;
  analysis: AnalysisResponse | null;
  activeSection: string;
}

const CHART_COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b"];

const KPI_META = [
  {
    key: "audience" as const,
    title: "Audience Score",
    icon: Layers,
    color: "text-violet-400",
    ring: "#8b5cf6",
    description: "Clarity of the song's audience identity",
  },
  {
    key: "emotion" as const,
    title: "Emotion Score",
    icon: Activity,
    color: "text-pink-400",
    ring: "#ec4899",
    description: "Emotional expressiveness and resonance",
  },
  {
    key: "virality" as const,
    title: "Virality Score",
    icon: Zap,
    color: "text-amber-400",
    ring: "#f59e0b",
    description: "Likelihood of short-form sharing & creator adoption",
  },
  {
    key: "growth" as const,
    title: "Growth Score",
    icon: TrendingUp,
    color: "text-emerald-400",
    ring: "#10b981",
    description: "Marketing and audience-expansion potential",
  },
];

function clamp(n: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function scoreBand(score: number): string {
  if (score >= 80) return "Exceptional";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Developing";
  return "Emerging";
}

export default function IntelligenceView({ track, lyrics, richSync, analysis, activeSection }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<IntelligenceReport | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const generatedForRef = useRef<number | null>(null);

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
    if (generatedForRef.current === track.commontrack_id) return;
    generatedForRef.current = track.commontrack_id;
    setReport(null);
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.commontrack_id]);

  useEffect(() => {
    if (activeSection && report) {
      const el = document.getElementById(`section-${activeSection}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [activeSection, report]);

  const radarData = useMemo(
    () =>
      report
        ? [
            { subject: "Audience", A: report.scores.audience, fullMark: 100 },
            { subject: "Emotion", A: report.scores.emotion, fullMark: 100 },
            { subject: "Virality", A: report.scores.virality, fullMark: 100 },
            { subject: "Growth", A: report.scores.growth, fullMark: 100 },
          ]
        : [],
    [report],
  );

  const distributionData = useMemo(
    () =>
      report
        ? [
            { name: "Archetypes", value: report.audienceArchetypes.length },
            { name: "Emotions", value: report.emotionalPositioning.length },
            { name: "Cultural", value: report.culturalPositioning.length },
            { name: "Viral", value: report.viralDrivers.length },
          ].filter((d) => d.value > 0)
        : [],
    [report],
  );

  const platformScores = useMemo(
    () =>
      report
        ? report.platformFit.map((p) => ({
            name: p.platform,
            score: p.score === "High" ? 90 : p.score === "Medium" ? 60 : 30,
          }))
        : [],
    [report],
  );

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
          Analyzing semantic meaning, mood metadata, cultural resonance, and platform mechanics...
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

  const confidence = clamp(report.confidence);

  return (
    <div
      className="flex-1 overflow-y-auto custom-scrollbar relative"
      ref={containerRef}
      data-report-root
      data-report-track={track.track_name}
    >
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
              <ShieldCheck className="w-3 h-3" />
              Confidence {confidence}%
            </span>
            <span className="text-xs text-muted-foreground">Gemini 2.5 Flash</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            title="Regenerate report"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-14">
        {/* Executive Briefing */}
        <ReportSection id="executive" eyebrow="Executive Briefing" icon={BrainCircuit} hideTitle>
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-primary mb-4">
                <BrainCircuit className="w-5 h-5" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Executive Briefing</h2>
              </div>
              <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground">{report.summary}</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {KPI_META.map((meta) => (
              <KpiCard
                key={meta.key}
                meta={meta}
                value={clamp(report.scores[meta.key])}
                confidence={confidence}
              />
            ))}
          </div>
        </ReportSection>

        {/* Intelligence Overview — Visualization layer */}
        <ReportSection id="overview" title="Intelligence Overview" icon={Sparkles}>
          <div className="grid md:grid-cols-3 gap-4">
            <ChartCard title="Score Profile" subtitle="Audience · Emotion · Virality · Growth">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Confidence" subtitle="Signal strength of this report">
              <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="100%"
                    barSize={14}
                    data={[{ name: "Confidence", value: confidence, fill: "hsl(var(--primary))" }]}
                    startAngle={90}
                    endAngle={90 - (360 * confidence) / 100}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold tracking-tight">{confidence}%</span>
                  <span className="text-xs text-muted-foreground">confidence</span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Signal Distribution" subtitle="Detected signals by category">
              {distributionData.length > 0 ? (
                <div className="relative w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="85%"
                        paddingAngle={3}
                        stroke="none"
                      >
                        {distributionData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
                {distributionData.map((d, i) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </ChartCard>
          </div>
        </ReportSection>

        {/* Audience Intelligence */}
        <ReportSection id="audience" title="Audience Intelligence" icon={Layers}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <SubLabel>Archetypes</SubLabel>
              {report.audienceArchetypes.map((a) => (
                <div key={a} className="p-4 rounded-xl border border-border bg-card">
                  <h4 className="font-semibold text-foreground">{a}</h4>
                </div>
              ))}
            </div>
            <EvidenceCallout title="Why this audience was detected" items={report.evidence.audience} accent="violet" />
          </div>
        </ReportSection>

        {/* Emotional Intelligence */}
        <ReportSection id="emotion" title="Emotional Intelligence" icon={Activity}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <SubLabel>Emotional Positioning</SubLabel>
              <div className="flex flex-wrap gap-2">
                {report.emotionalPositioning.map((e) => (
                  <span
                    key={e}
                    className="px-3 py-1.5 rounded-full border border-pink-500/20 bg-pink-500/10 text-pink-400 text-sm font-medium"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <EvidenceCallout title="What moods & themes created this" items={report.evidence.emotion} accent="pink" />
          </div>
        </ReportSection>

        {/* Cultural Intelligence */}
        <ReportSection id="cultural" title="Cultural Intelligence" icon={Globe}>
          <div className="grid md:grid-cols-3 gap-4">
            {report.culturalPositioning.map((c) => (
              <div
                key={c}
                className="p-5 rounded-xl border border-border bg-card hover:border-cyan-500/30 transition-colors"
              >
                <Globe className="w-5 h-5 text-cyan-400 mb-3" />
                <h4 className="font-semibold">{c}</h4>
              </div>
            ))}
          </div>
          <EvidenceCallout
            title="What cultural signals created this"
            items={report.evidence.culture}
            accent="cyan"
          />
        </ReportSection>

        {/* Virality Intelligence */}
        <ReportSection id="virality" title="Virality Intelligence" icon={Zap}>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <SubLabel>Viral Drivers</SubLabel>
              <ul className="space-y-3 mt-3">
                {report.viralDrivers.map((v, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SubLabel>Content Opportunities</SubLabel>
              <ul className="space-y-3 mt-3">
                {report.contentOpportunities.map((c, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ReportSection>

        {/* Growth Intelligence */}
        <ReportSection id="growth" title="Growth Intelligence" icon={TrendingUp}>
          <SubLabel>Recommendations</SubLabel>
          <div className="grid md:grid-cols-2 gap-4 mt-3">
            {report.growthRecommendations.map((r, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex gap-3"
              >
                <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm">{r}</span>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* Distribution Intelligence */}
        <ReportSection id="distribution" title="Distribution Intelligence" icon={Share2}>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <ChartCard title="Platform Fit" subtitle="Relative fit by surface" className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformScores} layout="vertical" margin={{ top: 0, right: 8, left: 30, bottom: 0 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    width={110}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="space-y-3">
              <SubLabel>Platform Rationale</SubLabel>
              {report.platformFit.map((p, i) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{p.platform}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.score === "High"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : p.score === "Medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {p.score} Fit
                    </span>
                  </div>
                  {p.reason && <p className="text-xs text-muted-foreground leading-relaxed">{p.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        </ReportSection>

        {/* Artist Actions */}
        <ReportSection id="actions" title="Artist Action Plan" icon={Target}>
          <div className="grid gap-3">
            {report.artistActions.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{i + 1}</span>
                </div>
                <span className="font-medium text-sm md:text-base">{a}</span>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* Evidence Layer */}
        <ReportSection id="evidence" title="Evidence Layer" icon={ListChecks}>
          <p className="text-sm text-muted-foreground -mt-2">
            Every conclusion above is grounded in the source signals below — derived from Musixmatch metadata, mood &
            theme analysis, and RichSync moments.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            <EvidenceColumn title="Audience" items={report.evidence.audience} accent="violet" />
            <EvidenceColumn title="Emotion" items={report.evidence.emotion} accent="pink" />
            <EvidenceColumn title="Culture" items={report.evidence.culture} accent="cyan" />
          </div>
        </ReportSection>

        <div className="pb-10" />
      </div>
    </div>
  );
}

/* ---------------- Reusable, export-friendly building blocks ---------------- */

function ReportSection({
  id,
  title,
  icon: Icon,
  eyebrow,
  hideTitle,
  children,
}: {
  id: string;
  title?: string;
  icon?: any;
  eyebrow?: string;
  hideTitle?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={`section-${id}`} data-report-section={id} className="scroll-mt-24 space-y-6">
      {!hideTitle && title && (
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
      )}
      {eyebrow && hideTitle && <span className="sr-only">{eyebrow}</span>}
      {children}
    </section>
  );
}

function KpiCard({
  meta,
  value,
  confidence,
}: {
  meta: (typeof KPI_META)[number];
  value: number;
  confidence: number;
}) {
  const Icon = meta.icon;
  return (
    <div className="p-5 rounded-2xl border border-border bg-card flex flex-col" data-export-kpi={meta.key}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{meta.title}</h3>
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className="text-sm text-muted-foreground">/100</span>
        <span className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
          {scoreBand(value)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary mt-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: meta.ring }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-snug">{meta.description}</p>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/60">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span className="text-[11px] text-muted-foreground">Confidence {confidence}%</span>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "h-52",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className={className}>{children}</div>
    </div>
  );
}

const ACCENTS: Record<string, { border: string; bg: string; bar: string; text: string }> = {
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    bar: "border-violet-500/50",
    text: "text-violet-400",
  },
  pink: { border: "border-pink-500/20", bg: "bg-pink-500/5", bar: "border-pink-500/50", text: "text-pink-400" },
  cyan: { border: "border-cyan-500/20", bg: "bg-cyan-500/5", bar: "border-cyan-500/50", text: "text-cyan-400" },
};

function EvidenceCallout({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  if (!items?.length) return null;
  return (
    <div className={`rounded-xl border ${a.border} ${a.bg} p-4`}>
      <div className={`flex items-center gap-2 mb-3 ${a.text}`}>
        <Quote className="w-4 h-4" />
        <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((e, i) => (
          <div key={i} className={`text-sm text-foreground/90 border-l-2 ${a.bar} pl-3 py-0.5`}>
            {e}
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceColumn({ title, items, accent }: { title: string; items: string[]; accent: keyof typeof ACCENTS }) {
  const a = ACCENTS[accent];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className={`text-sm font-semibold mb-3 ${a.text}`}>{title}</h3>
      {items?.length ? (
        <ul className="space-y-2">
          {items.map((e, i) => (
            <li key={i} className={`text-xs text-muted-foreground border-l-2 ${a.bar} pl-3 py-0.5`}>
              {e}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">No evidence provided.</p>
      )}
    </div>
  );
}

function SubLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{children}</h3>
  );
}

function EmptyChart() {
  return (
    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
      No data available
    </div>
  );
}
