import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Router as WouterRouter, useLocation } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppRoutes } from "@/App";
import { TRACK, LYRICS, RICHSYNC, ANALYSIS, REPORT } from "./fixtures";

type IntelBehavior = "success" | "error" | "never";

interface FetchCall {
  url: string;
  method: string;
}

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

function installFetchMock(opts: { intel?: IntelBehavior } = {}) {
  const intel = opts.intel ?? "success";
  const calls: FetchCall[] = [];

  const mock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    calls.push({ url, method });

    if (url.includes("/api/intelligence")) {
      if (intel === "never") return new Promise<Response>(() => {});
      if (intel === "error") return Promise.resolve(jsonResponse({ error: "boom" }, 500));
      return Promise.resolve(jsonResponse(REPORT));
    }
    if (url.includes("/api/track/")) return Promise.resolve(jsonResponse(TRACK));
    if (url.includes("/api/lyrics/")) return Promise.resolve(jsonResponse(LYRICS));
    if (url.includes("/api/richSync/")) return Promise.resolve(jsonResponse(RICHSYNC));
    if (url.includes("/api/analysis/")) return Promise.resolve(jsonResponse(ANALYSIS));
    return Promise.resolve(jsonResponse({}, 404));
  });

  vi.stubGlobal("fetch", mock);

  return {
    calls,
    intelPostCount: () =>
      calls.filter((c) => c.url.includes("/api/intelligence") && c.method === "POST").length,
  };
}

function LocationProbe() {
  const [loc] = useLocation();
  return <div data-testid="location">{loc}</div>;
}

function renderAt(path: string) {
  const { hook, navigate } = memoryLocation({ path, record: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const utils = render(
    <QueryClientProvider client={client}>
      <WouterRouter hook={hook}>
        <AppRoutes />
        <LocationProbe />
      </WouterRouter>
    </QueryClientProvider>,
  );
  const currentPath = () => screen.getByTestId("location").textContent ?? "";
  return { ...utils, navigate, currentPath };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("TrackWorkspace single-report guard", () => {
  it("generates the AI report only once across view-to-view navigation", async () => {
    const { intelPostCount } = installFetchMock({ intel: "success" });
    const { navigate } = renderAt("/track/55/overview");

    // The report renders on Overview (proving the POST happened and resolved).
    await screen.findByText("EXEC_BRIEFING_MARKER");
    expect(intelPostCount()).toBe(1);

    // Overview -> Audience: report is reused, no new POST.
    navigate("/track/55/audience");
    await screen.findByText("ARCHETYPE_ALPHA_MARKER");
    expect(intelPostCount()).toBe(1);

    // Audience -> Distribution: still reused.
    navigate("/track/55/distribution");
    await screen.findByText("PLATFORM_TIKTOK_MARKER");
    expect(intelPostCount()).toBe(1);
  });
});

describe("TrackWorkspace routing redirects", () => {
  it("redirects /track/:id to /track/:id/overview", async () => {
    installFetchMock({ intel: "success" });
    const { currentPath } = renderAt("/track/55");
    await waitFor(() => expect(currentPath()).toBe("/track/55/overview"));
  });

  it("redirects an unknown view to overview", async () => {
    installFetchMock({ intel: "success" });
    const { currentPath } = renderAt("/track/55/bogus");
    await waitFor(() => expect(currentPath()).toBe("/track/55/overview"));
  });
});

// The pages that must render independently of the AI report.
const COMING_SOON_PAGES = [
  { view: "performance", heading: "Performance Intelligence", partner: "Songstats" },
  { view: "live", heading: "Live Intelligence", partner: "JamBase" },
  { view: "sonic", heading: "Sonic Intelligence", partner: "Cyanite" },
] as const;

// Both report states in which the report-independent pages must still render.
const REPORT_STATES = [
  { label: "the report is still loading", intel: "never" as const, gateText: "Synthesizing Intelligence" },
  { label: "the report has errored", intel: "error" as const, gateText: "Analysis Failed" },
];

describe("Report-independent pages", () => {
  REPORT_STATES.forEach(({ label, intel, gateText }) => {
    it(`renders Source Data while ${label}`, async () => {
      installFetchMock({ intel });
      renderAt("/track/55/source");

      // Source Data renders from raw signals, not the AI report.
      await screen.findByRole("heading", { name: "Source Data", level: 1 });
      expect(screen.getAllByText("ALBUM_NAME_MARKER").length).toBeGreaterThan(0);
      // It must NOT be gated behind the report loader / error UI.
      expect(screen.queryByText(gateText)).not.toBeInTheDocument();
    });

    COMING_SOON_PAGES.forEach(({ view, heading, partner }) => {
      it(`renders the ${heading} coming-soon page while ${label}`, async () => {
        installFetchMock({ intel });
        renderAt(`/track/55/${view}`);

        await screen.findByRole("heading", { name: heading, level: 1 });
        // The partner name appears on the page and may also surface in the
        // right-rail Intelligence Sources panel — assert at least one match.
        expect(screen.getAllByText(partner).length).toBeGreaterThan(0);
        // Coming-soon pages don't depend on the report, so no gating UI.
        expect(screen.queryByText(gateText)).not.toBeInTheDocument();
      });
    });
  });
});
