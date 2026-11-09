# Fan art gallery

The 16 user-supplied s1–s16 images are preserved byte for byte in assets/fanart/*.jpg. Display-only WebP copies keep the original aspect ratio; no generative processing, retouching, or cropping was applied. Preview copies total approximately 2.4 MB. Creator names and source URLs were not supplied and remain empty in gallery-data.js.

Six short exhibition scenes pair a large piece with a smaller neighboring work on desktop; mobile emphasizes the main image. One scene advances per 0.65 viewport heights; the full pinned section adds 3.25 screens, with no wheel/touch interception. Buttons allow immediate scene navigation, the index opens all 16 artworks, and a profile link bypasses the exhibition. The normal Videos grid has no new animation.

The background is an original WebGL ribbon shader, capped at 30fps and at 1× mobile / 1.5× desktop pixel density. It stops offscreen, on a hidden document, and in static mode. A CSS background remains when WebGL is unavailable. Art remains ordinary DOM images, separate from the shader. Static mode is selectable and respects reduced motion. The native modal supports Escape, a persistent close control, and original-file links.

References studied: Codrops ScrollBasedLayoutAnimations (pinned, scrubbed layout transitions) and 3DCarousel (perspective movement). The implementation here uses native sticky positioning and scroll progress, with no copied demo artwork, vendored libraries, or external runtime requests.

Validation: 23 automated checks pass. Local browser checks confirmed scene navigation, reverse/native scrolling, all 16 index entries, full original-image loading, Escape closure, 390px mobile layout without horizontal overflow, and static mode exposing all six featured pieces. Original image hashes match all 16 supplied files. Physical phones, Safari, and OS-level reduced-motion toggling remain untested.
