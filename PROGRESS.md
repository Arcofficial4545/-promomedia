# Progress

- [x] **Phase 1 — Foundation.** Next.js 16 + TS strict + Tailwind v4 `@theme`
  tokens, fonts (Space Grotesk / Inter / JetBrains Mono), primitives (Button,
  Card, Input, Badge, Container, Section), header/footer shell, Lenis smooth
  scroll + reduced-motion hook, placeholder home. Build verified.
- [x] **Phase 2 — Data layer.** Drizzle schema + migrations (local SQLite,
  12 tables), typed repositories, auth/storage adapters, seed script (16
  stores, 52 coupons, 6 posts, 6 promos, admin user), `DATA_LAYER.md`.
  Build verified.
- [x] **Phase 3 — Coupon Ticket + reveal + redirect.** Mask-notched ticket
  with reveal/copy/toast, terms accordion, expiry states; `/go/[couponId]`
  route with rate limiting, hashed-UA click logging, counter increment.
  Verified end-to-end (302 to store, click rows written).
- [x] **Phase 4 — Public content pages.** Stores directory (search, category
  filter, sort, pagination) + profile (coupons, sidebar best-deal, related
  posts), coupons feed, categories index + detail, global search, about /
  contact (working form + `contact_messages` table) / disclosure / privacy /
  terms, JSON-LD, dynamic OG images, sitemap + robots. All routes 200.
- [x] **Phase 5 — Hero + home + motion polish.** "The Deal Grid" hero:
  canvas grid (idle drift + mouse parallax, paused offscreen), kinetic masked
  headline (GSAP), command search, 4 floating tickets (idle float + parallax
  + scroll rotate-out), live ticker marquee, count-up stats; full home:
  trust strip, featured deals, categories, trending stores, blog teasers,
  newsletter band. Reduced-motion fallbacks throughout. Verified in browser.
- [x] **Phase 6 — Blog.** Tiptap→React renderer (headings/lists/quotes/code/
  images/links + live couponEmbed + promoSlot hook), blog index (featured +
  grid + filters), article page (TOC scroll-spy, progress bar, share rail,
  related deals, author bio, view ping, Article JSON-LD), blog category
  pages, RSS feed. Embedded tickets verified rendering.
- [ ] **Phase 7 — Promotional units + newsletter.**
- [ ] **Phase 8 — Admin portal.**
- [ ] **Phase 9 — Hardening.** A11y, perf, SEO, security, QA.
