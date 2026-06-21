---
name: JamBase API v3
description: Confirmed JamBase v3 origin, auth, endpoints, and event/venue response shape used by the Live Intelligence layer.
---

# JamBase API v3 (confirmed by live probe)

- **Base/origin:** `https://api.data.jambase.com/v3` (the older `www.jambase.com/jb-api/v1` origin rejects current keys with HTTP 403 `api_key_invalid`).
- **Auth:** `Authorization: Bearer <JAMBASE_API_KEY>` header. v3 does NOT accept the v1 `?apikey=` query param (returns 401 "Missing Authorization header").
- **Endpoint paths are identical across origins:** `/artists`, `/events`, `/venues`.

## Endpoints used
- `GET /artists?artistName=<name>` → `{ success, pagination, artists: [...] }`. Each artist: `identifier` (e.g. `jambase:242562`), `name`, `url`, `image`, `genre[]`, `x-numUpcomingEvents` (authoritative upcoming count).
- `GET /events?artistId=<jambase:ID>&page=<n>` → `{ success, pagination:{page,perPage,totalItems,totalPages,nextPage,previousPage}, events:[...] }`. 40/page. `nextPage` is a full URL or null.

## Event shape (real fields)
- `identifier`, `name`, `url` (jambase show page), `image`, `eventStatus` ("scheduled"), `startDate` (e.g. `2026-06-22T19:20:00`), `endDate`.
- `location` (`@type: Venue`): `name`, `identifier`, `url`, `maximumAttendeeCapacity` (number), `x-numUpcomingEvents`, `geo.{latitude,longitude}`, and `address`:
  - `addressLocality` = city
  - `addressRegion` = state/region — **can be an empty object `{}`** for non-US venues; guard for string | {name|alternateName} | {}.
  - `addressCountry` = `{ identifier: "FR" (ISO2), name: "France", alternateName: "FRA" }`
- `offers[]` = ticketing links (`category: ticketingLinkPrimary|ticketingLinkSecondary`, `seller.name`, `url`).
- `performer[]` = `{ name, identifier, x-isHeadliner, x-performanceRank }`.

**Why:** built the SignalScope "Live Intelligence" layer on these confirmed fields only (no fabrication). Coldplay returned 0 upcoming; Iron Maiden (`jambase:242562`) had 47 across 2 pages — good fixtures for data-present testing.
