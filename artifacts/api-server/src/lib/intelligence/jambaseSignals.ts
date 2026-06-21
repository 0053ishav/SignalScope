import type {
  JamBaseLiveData,
  JamBaseSignal,
  JamBaseSignals,
} from "@/types/jambase";

/**
 * Convert normalized JamBase live data into reusable intelligence signals.
 *
 * Each signal is grounded in a REAL returned/derived metric (`metricValue`).
 * The thresholds below decide whether a metric is notable enough to *label*;
 * they never invent a number. `label`/`detail` are honest interpretations of
 * the real value, framed as interpretation rather than fabricated data.
 *
 * These signals feed the deterministic, data-gated frontend composition in the
 * Overview Executive Briefing and Growth Intelligence — they are never injected
 * into the Gemini prompt.
 */

const THRESHOLDS = {
  activeTouring: 1,
  touringMomentum: 12,
  multiMarket: 2,
  arenaCapacity: 15_000,
  marketConcentration: 3,
};

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function deriveJamBaseSignals(data: JamBaseLiveData): JamBaseSignals {
  const signals: JamBaseSignal[] = [];

  if (data.upcomingEventCount >= THRESHOLDS.touringMomentum) {
    signals.push({
      id: "touring-momentum",
      category: "touring",
      label: "Heavy Touring Momentum",
      detail: `${data.upcomingEventCount} upcoming shows signal an active live campaign to align releases and content around.`,
      metricKey: "upcomingEventCount",
      metricValue: data.upcomingEventCount,
    });
  } else if (data.upcomingEventCount >= THRESHOLDS.activeTouring) {
    signals.push({
      id: "active-touring",
      category: "touring",
      label: "Active Touring",
      detail: `${data.upcomingEventCount} upcoming show${data.upcomingEventCount === 1 ? "" : "s"} confirm a live presence to build promotion around.`,
      metricKey: "upcomingEventCount",
      metricValue: data.upcomingEventCount,
    });
  }

  if (data.countryCount >= THRESHOLDS.multiMarket) {
    signals.push({
      id: "multi-market-reach",
      category: "geographic",
      label: "Multi-Market Reach",
      detail: `The run spans ${data.countryCount} countries and ${data.cityCount} cities — a genuinely international live footprint.`,
      metricKey: "countryCount",
      metricValue: data.countryCount,
    });
  }

  if (data.largestVenue && data.largestVenue.capacity >= THRESHOLDS.arenaCapacity) {
    signals.push({
      id: "arena-scale-demand",
      category: "demand",
      label: "Arena-Scale Demand",
      detail: `A ${compact(data.largestVenue.capacity)}-capacity date at ${data.largestVenue.name} indicates arena-scale live demand.`,
      metricKey: "largestVenue.capacity",
      metricValue: data.largestVenue.capacity,
    });
  }

  const topCity = data.topCities[0];
  if (topCity && topCity.count >= THRESHOLDS.marketConcentration) {
    signals.push({
      id: "market-concentration",
      category: "concentration",
      label: "Concentrated Market",
      detail: `${topCity.count} shows in ${topCity.name} point to a stronghold market worth prioritizing for activations.`,
      metricKey: "topCity.count",
      metricValue: topCity.count,
    });
  }

  return { signals };
}
