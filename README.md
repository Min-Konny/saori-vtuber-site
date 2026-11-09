# Saori VTuber site

Existing static design with a Vercel Node.js function for the latest public YouTube uploads.

## Setup

- Existing Vercel project: `saori-vtuber-site` (GitHub `Min-Konny/saori-vtuber-site`).
- Set `YOUTUBE_API_KEY` as a sensitive server-side Vercel environment variable. Restrict it to YouTube Data API v3. Never use a public-prefixed variable or commit a key.
- Production registration does not configure Preview or Development. Do not export production secrets for local tests.
- Deployment is a separate action. Changing the environment variable does not modify an existing deployment.
- Node.js 24, no third-party runtime dependencies. `npm test` runs mocked tests without a key or API traffic.

## Behavior

`GET /api/videos` resolves the fixed channel's uploads playlist, reads up to 30 recent upload IDs, then fetches public video metadata. It excludes scheduled and currently-live videos and returns at most 3 items in publication order. Completed streams are labeled as archives. Shorts are not strictly classified or excluded. Older uploads outside the first page are not searched.

The browser receives only video ID, title, publication date and archive flag. URLs are built from validated video IDs, titles are inserted as text, and upstream errors and credentials are never returned or logged. No arbitrary channel or URL parameters are accepted. Google API keys are sent in a request header, never a URL.

Vercel CDN caches successful responses for 30 minutes (plus up to 60 seconds stale revalidation), with a 60-second browser cache. This is demand-driven, not a scheduled job: the next visit after expiry triggers refresh. An already-open page does not poll. CDN cache distribution and cold misses mean this is not a guaranteed global quota cap. Each refresh uses at most 3 quota units under the current list-method costs; no automatic retries. Configure and monitor the Google project's daily quota separately. Function work is bounded by a 12-second upstream abort and 20-second Vercel duration.

If the API key is absent, quota is exceeded, Google fails, or returned data is invalid, the endpoint fails closed with a sanitized 503. The UI explicitly tells visitors the list could not be loaded and leaves the channel link available. It does not present old hardcoded cards as current. Empty successful results have a separate message. JavaScript-disabled browsers get a channel link and explanation.

## Validation still required before calling this live

- Deploy only after permission to publish this change.
- Confirm Vercel detects `/api/videos` as a Node function, returns actual channel videos and caches the successful response.
- Verify desktop/mobile UI, outgoing video links, missing-key/error state on a non-production test environment, and no credentials in browser assets/responses.
- Confirm the current Vercel plan is appropriate for the site's commercial use (the site includes product sales links); no plan or billing changes are made by this implementation.

## Tests

`npm test` covers fixed-channel request boundaries, caching headers, absence of keys from URLs/responses, live/scheduled/private/foreign-video filtering, latest-three ordering, archive flags, missing key, quota failure, malformed upstream response, no retries, empty results, client text safety, failed loads, and noscript fallback. These are local mock tests, not a successful live Google API integration.
