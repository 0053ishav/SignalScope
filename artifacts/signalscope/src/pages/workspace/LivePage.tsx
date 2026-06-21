import {
  CalendarDays,
  MapPin,
  Building2,
  Globe2,
  Map as MapIcon,
  Ticket,
  ExternalLink,
  Sparkles,
  Loader2,
  Users2,
} from "lucide-react";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import IntelligenceCard from "@/components/workspace/IntelligenceCard";
import JamBaseUnavailable from "@/components/workspace/JamBaseUnavailable";
import { useTrackWorkspace } from "@/context/TrackWorkspaceContext";
import {
  formatCompactNumber,
  formatEventDate,
  formatEventTime,
  eventLocation,
} from "@/lib/jambase";
import type {
  JamBaseLiveData,
  JamBaseSignal,
  JamBaseSignalCategory,
} from "@/types/jambase";

const CATEGORY_COLOR: Record<JamBaseSignalCategory, string> = {
  touring: "text-emerald-400",
  geographic: "text-cyan-400",
  demand: "text-violet-400",
  concentration: "text-amber-400",
};

export default function LivePage() {
  const { jambase, jambaseSignals, jambaseStatus } = useTrackWorkspace();

  return (
    <WorkspacePage
      id="live"
      title="Live Intelligence"
      description="Real touring & live-event intelligence from JamBase — upcoming shows, venue scale, tour footprint, and market concentration. Shown only when JamBase returns it; nothing is estimated."
    >
      {jambaseStatus === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading JamBase live & touring data…</span>
        </div>
      )}

      {jambaseStatus !== "loading" && (jambaseStatus !== "ok" || !jambase) && (
        <JamBaseUnavailable status={jambaseStatus} />
      )}

      {jambaseStatus === "ok" && jambase && (
        <LiveBody data={jambase} signals={jambaseSignals?.signals ?? []} />
      )}
    </WorkspacePage>
  );
}

function LiveBody({ data, signals }: { data: JamBaseLiveData; signals: JamBaseSignal[] }) {
  const maxCity = data.topCities.length ? Math.max(...data.topCities.map((c) => c.count)) : 0;
  const maxCountry = data.topCountries.length
    ? Math.max(...data.topCountries.map((c) => c.count))
    : 0;

  return (
    <div className="space-y-8">
      <p className="text-[11px] text-muted-foreground">
        Source: <span className="font-medium text-foreground/80">JamBase</span>
        {data.artistName && <> · {data.artistName}</>}
        {data.lastUpdated && <> · updated {new Date(data.lastUpdated).toLocaleDateString()}</>}
      </p>

      {/* Headline live KPIs — only those backed by a real positive value. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <LiveKpi icon={Ticket} label="Upcoming Shows" value={formatCompactNumber(data.upcomingEventCount)} show={data.upcomingEventCount > 0} />
        <LiveKpi icon={Building2} label="Venues" value={formatCompactNumber(data.venueCount)} show={data.venueCount > 0} />
        <LiveKpi icon={MapPin} label="Cities" value={formatCompactNumber(data.cityCount)} show={data.cityCount > 0} />
        <LiveKpi icon={Globe2} label="Countries" value={formatCompactNumber(data.countryCount)} show={data.countryCount > 0} />
      </div>

      {/* Venue Intelligence — largest venue by stated capacity (real). */}
      {data.largestVenue && data.largestVenue.capacity > 0 && (
        <IntelligenceCard title="Venue Intelligence" icon={Building2} iconClassName="text-violet-400">
          <p className="text-xs text-muted-foreground -mt-1 mb-3">
            Largest venue on the upcoming run, by stated capacity from JamBase.
          </p>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card/40 p-4">
            <div className="w-12 h-12 rounded-lg bg-violet-400/10 text-violet-400 flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xl font-bold text-foreground">
                {formatCompactNumber(data.largestVenue.capacity)}
                <span className="text-sm font-normal text-muted-foreground"> capacity</span>
              </div>
              <div className="text-sm text-foreground truncate">{data.largestVenue.name}</div>
              {(data.largestVenue.city || data.largestVenue.country) && (
                <div className="text-xs text-muted-foreground truncate">
                  {[data.largestVenue.city, data.largestVenue.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>
        </IntelligenceCard>
      )}

      {/* Interpretive signals derived from real JamBase metrics. */}
      {signals.length > 0 && (
        <IntelligenceCard title="Live Signals" icon={Sparkles} iconClassName="text-violet-400">
          <p className="text-xs text-muted-foreground -mt-1 mb-3">
            Plain-language readings derived directly from JamBase touring data.
          </p>
          <div className="space-y-2.5">
            {signals.map((s) => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/40">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${CATEGORY_COLOR[s.category].replace("text-", "bg-")}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{s.label}</span>
                    <span className={`text-[10px] uppercase tracking-wide ${CATEGORY_COLOR[s.category]}`}>
                      {s.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </IntelligenceCard>
      )}

      {/* Market Concentration — top cities & countries by event count. */}
      {(data.topCities.length > 0 || data.topCountries.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-4">
          {data.topCities.length > 0 && (
            <IntelligenceCard title="Top Cities" icon={MapPin} iconClassName="text-cyan-400">
              <p className="text-xs text-muted-foreground -mt-1 mb-3">Cities ranked by upcoming shows.</p>
              <MarketBars markets={data.topCities} max={maxCity} barClass="bg-cyan-400/70" />
            </IntelligenceCard>
          )}
          {data.topCountries.length > 0 && (
            <IntelligenceCard title="Top Countries" icon={Globe2} iconClassName="text-emerald-400">
              <p className="text-xs text-muted-foreground -mt-1 mb-3">Countries ranked by upcoming shows.</p>
              <MarketBars markets={data.topCountries} max={maxCountry} barClass="bg-emerald-400/70" />
            </IntelligenceCard>
          )}
        </div>
      )}

      {/* Tour Footprint / Geographic Reach summary. */}
      {data.countryCount > 0 && (
        <IntelligenceCard title="Geographic Reach" icon={MapIcon} iconClassName="text-cyan-400">
          <p className="text-sm text-foreground/90 leading-relaxed">
            This upcoming run spans{" "}
            <span className="font-semibold text-foreground">{data.cityCount}</span>{" "}
            {data.cityCount === 1 ? "city" : "cities"} across{" "}
            <span className="font-semibold text-foreground">{data.countryCount}</span>{" "}
            {data.countryCount === 1 ? "country" : "countries"}, playing{" "}
            <span className="font-semibold text-foreground">{data.venueCount}</span>{" "}
            distinct {data.venueCount === 1 ? "venue" : "venues"}.
          </p>
        </IntelligenceCard>
      )}

      {/* Upcoming Shows — the real event list. */}
      <IntelligenceCard title="Upcoming Shows" icon={CalendarDays} iconClassName="text-emerald-400">
        {data.upcomingEvents.length > 0 ? (
          <>
            <p className="text-xs text-muted-foreground -mt-1 mb-3">
              {data.upcomingEvents.length} upcoming{" "}
              {data.upcomingEvents.length === 1 ? "event" : "events"} from JamBase.
            </p>
            <div className="space-y-2">
              {data.upcomingEvents.map((e) => {
                const loc = eventLocation(e);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card/40 p-3"
                  >
                    <div className="flex flex-col items-center justify-center w-16 shrink-0 text-center">
                      <span className="text-sm font-semibold text-foreground">{formatEventDate(e.date)}</span>
                      {formatEventTime(e.date) && (
                        <span className="text-[10px] text-muted-foreground">{formatEventTime(e.date)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-foreground truncate">
                        {e.venueName || e.name || "Venue TBA"}
                      </div>
                      {loc && (
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {loc}
                          {e.venueCapacity ? <span> · {formatCompactNumber(e.venueCapacity)} cap</span> : null}
                        </div>
                      )}
                    </div>
                    {e.url && (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Open Event</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            JamBase reports {data.upcomingEventCount} upcoming{" "}
            {data.upcomingEventCount === 1 ? "show" : "shows"} but returned no detailed event list.
          </p>
        )}
      </IntelligenceCard>

      {data.artistUrl && (
        <a
          href={data.artistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View {data.artistName} on JamBase
        </a>
      )}
    </div>
  );
}

function LiveKpi({
  icon: Icon,
  label,
  value,
  show,
}: {
  icon: typeof Ticket;
  label: string;
  value: string;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function MarketBars({
  markets,
  max,
  barClass,
}: {
  markets: { name: string; count: number }[];
  max: number;
  barClass: string;
}) {
  return (
    <div className="space-y-2.5">
      {markets.map((m) => (
        <div key={m.name} className="flex items-center gap-3">
          <span className="text-sm text-foreground w-32 sm:w-40 shrink-0 truncate" title={m.name}>
            {m.name}
          </span>
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full ${barClass} rounded-full`}
              style={{ width: `${max ? (m.count / max) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{m.count}</span>
        </div>
      ))}
    </div>
  );
}
