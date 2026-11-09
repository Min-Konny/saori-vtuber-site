# Responsive display polish (not published)

Base production commit: d6343e1. Changes are limited to presentation CSS and regression tests. The original portrait, 13 Works entries, links and video-fetch code are unchanged.

- Navigation and hero buttons have at least 44 CSS px target height. Narrow navigation uses a stable two-row grid with the logo separate.
- The floating SHOP shortcut is hidden below 600px, avoiding overlap with portrait/video/list content. The navigation SHOP link and shop section remain.
- Desktop portrait height responds to viewport height; small-screen title spacing and portrait stage are tighter without cropping.
- Link cards can shrink to narrow containers; persistent arrows identify links on touch screens.
- Last Works row spacing is restored. Motion-preference CSS reduces transitions and hides decorative canvases (does not claim all JavaScript animation work stops).

Validation: automated tests and whitespace checks. Browser rendering of this unpublished revision has not been verified. Prior production was checked at 1180 and 400 CSS px, with the latter achieved through ordinary cloud window resizing/zoom, not a physical mobile device.

Before publication: obtain approval. After approved deployment, inspect 320/390/400/768/1180 CSS px where available, navigation anchors, full portrait, all 13 Works, links and three dynamic videos. Do not bypass the existing cloud DevTools restriction. Local preview and cloud browser are separate environments; a prior localhost attempt could not connect.
