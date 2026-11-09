# Private key visual layout preparation

Base: published ca956fe. This branch is local only. Do not deploy without approval.

## Prepared
- Large desktop hero composition with a portrait stage; vertically stacked at 900px and below.
- Existing pink/lavender, heart, sparkle and candy motifs. No external images or fabricated character art.
- User-supplied transparent PNG is now integrated as assets/saori-keyvisual.png (1448×2048, 740453 bytes). Original pixels and transparency are retained unchanged. SHA-256: 2ec90ea86342ce5cacbdcbd97b3b71f123c8e33f6aec1ff42bd7505185e6505c.
- Portrait CSS uses contain, preserving the full supplied image rather than cropping it.
- Navigation logo participates in normal flow; at narrow widths it has a separate row above wrapping links.
- All 13 Works entries remain directly visible without expand controls or reveal animation. Desktop uses compact date/title/partner rows, narrow width uses stacked rows.
- Links, video API/client, shop, profile, tags, and content preserved.

## Final review before publication
1. Supplied image has been visually inspected; the original is separately preserved in the task input directory.
2. The original PNG is only 740 KB, so it is retained without lossy conversion.
3. The fallback/draft note was replaced with img.hero-keyvisual, dimensions, alt and fetchpriority. Contain preserves the complete portrait.
4. Verify 390/400px and desktop layout, no crop/overflow, navigation overlap, Works all visible and live videos unaffected.
5. Obtain approval before publishing. Do not upload the not-yet-received image or commit credentials.

## Verification
- npm test: content checks plus existing video regressions.
- git diff --check.
- Browser rendering of this new local branch has NOT yet been verified. The production 400px test described previously is for the old published layout, not this preparation.
- Local independent Chromium launch was previously blocked by the runtime. Do not repeat it or alter browser security policy. Use an authorized local-preview route when available.

## Preview route
On a machine that holds this checkout, run `python3 -m http.server 8765 --bind 127.0.0.1` and open http://127.0.0.1:8765/ in that same machine’s browser. Static preview has no YouTube server route and must show its honest fallback; video logic remains covered by mocked regression tests.

The permitted loopback server started in this executor, but the separate cloud browser returned ERR_CONNECTION_REFUSED when opening it. The server was stopped; no public tunnel or preview deployment was created. Desktop/narrow visual QA of this branch remains pending.
