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

## Phase 2 — Data layer

- **Two DB entry points:** `lib/db/client.ts` (adds `server-only`, used by app
  code) re-exports `lib/db/client-node.ts` (plain Node, used by seed/migrate
  scripts run via tsx). The `server-only` package throws when imported outside
  a React server bundle, so scripts can't share the guarded module.
- **Single taxonomy:** blog posts reference the same `categories` table as
  stores (posts about "AI Tools" live under the AI Tools category). Avoids a
  parallel blog-category table; `/blog/category/[slug]` filters on it.
- **Password hashing:** Node's built-in scrypt
  (`scrypt$N$r$p$salt$hash` format) instead of bcrypt — no extra native dep,
  and it lives in `lib/auth/password.ts` without `server-only` so the seed
  script can hash the admin password.
- **Sessions:** HMAC-SHA256 signed cookie (`lib/auth/session.ts`),
  verifiable in `proxy.ts` without a DB hit. Swappable for Supabase Auth.
- **Store logos:** seeded as `null`; the UI renders a solid brand-initial
  tile when no logo is uploaded. Real logos come via the admin media library.
  Avoids hotlinking third-party assets.
- **`affiliateBaseUrl`** seeded with the plain website URL as a placeholder
  per the spec; real partner URLs are added later through the admin.
- **Timestamps** stored as `timestamp_ms` integers in SQLite → map cleanly to
  `timestamptz` in Postgres later.
- **Seed is destructive** (wipe + insert) — it's a dev tool; documented in
  DATA_LAYER.md. Prints admin credentials once; `.env.local` pins them.

## Phase 3 — Coupon Ticket + redirect

- **Ticket notches** use CSS `mask` with hard-stop radial cutouts — the
  spec-sanctioned technique (masks/radial cutouts); no visible color
  gradients anywhere.
- **Reveal flow:** the "Get Code" control is a real `<a href="/go/…"
  target="_blank" rel="sponsored noopener">` so link semantics/SEO hygiene
  are correct; the click handler reveals + copies + toasts and lets default
  navigation open the store tab. Codes are masked visually (first 2 + last 2
  chars) rather than withheld from the DOM — withholding buys nothing since
  the reveal must work offline-fast, and the code is public anyway.
- **Expiry is computed against a per-mount timestamp** (lazy `useState`
  initializer) because the React Compiler purity lint forbids `Date.now()` in
  render.
- **`/go` logging is fire-and-forget** (`void Promise.allSettled`) so the 302
  is never blocked by analytics writes; the route validates UUID form,
  rate-limits per IP (30/min), and only redirects to http(s) destinations.

## Phase 4 — Public pages

- **Added a `contact_messages` table** (migration 0001) — section 7.11
  requires storing contact submissions but section 6 omitted a table.
- **Filtering is URL-driven** (`?q=&category=&sort=&page=`): the FilterBar
  client component just rewrites searchParams (debounced), the server
  re-renders. Shareable/crawlable result URLs, no client data fetching.
- **OG images** use the default sans font in `ImageResponse` — brand comes
  from the pine/emerald layout. Loading Space Grotesk into the OG renderer
  requires bundling a font file; revisit in Phase 9 if worth it.
- **/search is `robots: noindex`** (thin/duplicate content) but present in
  the WebSite SearchAction JSON-LD.

## Phase 5 — Hero + home

- **Hero search is a plain GET form** (`action="/search"`) — zero JS for the
  primary CTA; works before hydration.
- **Canvas grid** pauses via IntersectionObserver when scrolled past, caps
  DPR at 2, and lerps parallax offsets — all rAF, transform/paint only.
- **Ticker + trust strip are CSS marquees** (translateX keyframes, paused on
  hover, disabled under reduced motion) instead of JS marquees.
- **Floating tickets are decorative** (`aria-hidden`, non-interactive) —
  real deals live below the fold; keeps the hero light and honest for AT.
- **Lenis ↔ ScrollTrigger sync** happens inside the hero's `useGSAP`
  (`lenis.on("scroll", ScrollTrigger.update)`) so GSAP stays out of the
  shared client bundle for non-home pages.
- React Compiler lint enforced two patterns worth keeping: no `Date.now()`
  in render (moved to module-level helpers / lazy state), no synchronous
  `setState` in effects (reduced-motion values render directly).

## Phase 8 — Admin portal

- **Route-group split:** `/admin/login` sits outside the gated
  `(panel)` route group so the auth-checking layout never wraps the login
  page; `proxy.ts` is the outer wall, `requireAdmin()` in the panel layout
  (and every server action) is the inner wall.
- **Forms:** React Hook Form manages client state; the server action is the
  single source of validation truth (shared Zod schemas in
  `lib/validators/admin.ts`, input coercion via `z.coerce`). Client-side
  zodResolver was skipped for admin forms — server errors surface via toast,
  which keeps ~6 forms materially simpler with no double-schema typing.
- **React Compiler warnings** for `useReactTable`/`watch()` are expected:
  the compiler skips those components (documented incompatible libraries);
  behavior is unaffected.
- **`revalidatePath("/", "layout")`** after content mutations — content
  (stores/coupons/posts/promos) surfaces on many public routes, so a broad
  revalidation beats maintaining a per-entity path list at this scale.
- **CSV exports are route handlers** (not actions) so they can stream a
  download; both check the session and return 401 without it (proxy also
  gates them).
- **Delete UX:** inline two-step confirm (`DeleteButton`) instead of a modal
  — fewer moving parts, keyboard-friendly, same safety.
