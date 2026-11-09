# Scroll showcase review

Base: a0fe649. Reference reel DfL6sY4R27h was viewed through Instagram's public player, without login or downloading media. Observed large floating image cards and thin geometric grid imagery. This is a pink adaptation, not an exact copy.

Implementation: assets/showcase.css and one stylesheet link. Existing supplied portrait, 13 always-visible Works, all links, shop assets and video API/client remain unchanged. Videos become large single-column cards. Desktop browsers supporting CSS view timelines progressively stack cards with scroll-linked translation/scale/depth; thumbnails gently settle to their natural scale. Reverse scroll reverses the effect. Decorative grid and portrait outline use CSS only. Mobile cards remain in ordinary flow; small-screen shop cards become single-column. Reduced-motion and browsers without timeline support retain static readable cards. No new dependency, network request, animation loop, autoplay media, gesture capture or AI image processing.

Validation: 19 automated tests pass, including API/mock frontend tests, content-preservation and CSS fallback checks; git diff --check passes. These tests do not prove animation/rendering quality. Private browser preview remains unavailable because the browser and local checkout are separate environments; previously blocked DevTools/local browser routes were not retried. No push or deployment has occurred for this feature.

After publication approval: inspect desktop full-card height/sticky transitions and reverse scroll; Tab focus every card; narrow 400px/no horizontal overflow; all 13 Works visible; API failure fallback and three live videos; reduced-motion/static fallback. Safari and physical mobile devices remain separate checks.
