# Decisions

Running log of senior-level decisions made during the build. Newest last.

## Phase 1 — Foundation

- **Repo scope:** `C:\Users\LENOVO` is itself a git repo pointing at an
  unrelated project. Initialized a dedicated repo inside `promomedia/` so this
  project has its own clean history.
- **Versions installed:** Next.js 16.2.10, React 19.2.4, Tailwind CSS 4.3.2,
  TypeScript strict (scaffold default). React Compiler enabled
  (`reactCompiler: true` was set by create-next-app; keeping it unless build
  times degrade).
- **Directory layout:** no `src/` dir, matching the structure in the build
  spec (`app/`, `components/`, `lib/` at root).
- **`cn` helper:** wrote a 5-line local `cn()` instead of adding
  `clsx` + `tailwind-merge`. Class conflicts are avoided by construction
  (variants never overlap); fewer deps.
- **Glossy button recipe lives in CSS** (`@layer components` in
  `globals.css`) as `.btn-gloss` + variant classes rather than inline Tailwind
  arbitrary values — the recipe involves pseudo-elements and multi-layer inset
  shadows that are unreadable as utility soup. The Button component composes
  these classes. No gradients used; sheen is a blurred solid-white
  pseudo-element per spec 4.5.
- **Fonts:** Space Grotesk (display), Inter (body), JetBrains Mono (mono) via
  `next/font/google` (self-hosted at build time, zero layout shift). Skipped
  the optional Clash Display upgrade — it is not on Google Fonts and would
  need a manual license/file; revisit if the hero H1 needs more character.
- **Lenis:** `ReactLenis` root provider with `autoRaf`, `lerp 0.12`, disabled
  on touch (`pointer: coarse` / `maxTouchPoints`) and
  `prefers-reduced-motion`. GSAP ScrollTrigger sync will be wired inside the
  hero scene (Phase 5) rather than globally, keeping GSAP out of the shared
  bundle.
- **Sonner Toaster** mounted in the `(site)` layout, styled pine/white to
  match the design system.
- **Newsletter form** ships as a rendering, validating client component with
  a clearly-marked TODO to swap in the real server action in Phase 7.
