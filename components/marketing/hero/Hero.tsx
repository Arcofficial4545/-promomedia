"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { Search } from "lucide-react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { CountUp } from "./CountUp";
import { FloatingTicket, type FloatingTicketData } from "./FloatingTicket";
import { HeroGridCanvas } from "./HeroGridCanvas";

gsap.registerPlugin(ScrollTrigger);

export type TickerItem = {
  storeName: string;
  discountLabel: string;
  isNew: boolean;
};

type HeroProps = {
  couponCount: number;
  storeCount: number;
  tickets: FloatingTicketData[];
  tickerItems: TickerItem[];
};

const HEADLINE: { word: string; accent?: boolean }[] = [
  { word: "Find" },
  { word: "the" },
  { word: "code", accent: true },
  { word: "before" },
  { word: "you" },
  { word: "checkout." },
];

export function Hero({
  couponCount,
  storeCount,
  tickets,
  tickerItems,
}: HeroProps) {
  const scope = useRef<HTMLDivElement>(null);
  const ticketsLayerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(pointer: coarse)", true);
  const lenis = useLenis();

  useGSAP(
    () => {
      if (reducedMotion) return;

      // Keep ScrollTrigger in sync with Lenis smooth scrolling.
      lenis?.on("scroll", ScrollTrigger.update);

      // Kinetic headline: masked word rise, staggered.
      gsap.fromTo(
        ".hero-word-inner",
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.07,
          delay: 0.15,
        },
      );

      // Supporting content fades up after the headline.
      gsap.fromTo(
        ".hero-rise",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.55,
        },
      );

      // Floating tickets drift in.
      gsap.fromTo(
        ".hero-ticket",
        { opacity: 0, scale: 0.92, y: 26 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.7,
        },
      );

      // Parallax out on scroll: content lifts and fades, tickets rotate away.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
      tl.to(".hero-content", { yPercent: -14, opacity: 0.25 }, 0);
      tl.to(".hero-ticket-a", { yPercent: -36, rotate: 7 }, 0);
      tl.to(".hero-ticket-b", { yPercent: -52, rotate: -8 }, 0);
      tl.to(".hero-ticket-c", { yPercent: -28, rotate: 5 }, 0);
      tl.to(".hero-ticket-d", { yPercent: -44, rotate: -5 }, 0);

      // Mouse parallax on the ticket layer.
      if (!isTouch && ticketsLayerRef.current) {
        const xTo = gsap.quickTo(ticketsLayerRef.current, "x", {
          duration: 0.7,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(ticketsLayerRef.current, "y", {
          duration: 0.7,
          ease: "power3.out",
        });
        const onMove = (e: MouseEvent) => {
          xTo((e.clientX / window.innerWidth - 0.5) * -24);
          yTo((e.clientY / window.innerHeight - 0.5) * -16);
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
      }
    },
    { scope, dependencies: [reducedMotion, isTouch, lenis] },
  );

  const [ticketA, ticketB, ticketC, ticketD] = tickets;

  return (
    <section
      ref={scope}
      className="relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-pine text-white"
    >
      <HeroGridCanvas className="absolute inset-0 -z-10 h-full w-full" />

      {/* Floating tickets (decorative, desktop only) */}
      <div
        ref={ticketsLayerRef}
        className="absolute inset-0 -z-[5] hidden lg:block"
        aria-hidden="true"
      >
        {ticketA && (
          <FloatingTicket
            ticket={ticketA}
            className="hero-ticket hero-ticket-a absolute top-[16%] left-[6%]"
            floatDuration="7.5s"
            rotate="-4deg"
          />
        )}
        {ticketB && (
          <FloatingTicket
            ticket={ticketB}
            tone="mint"
            className="hero-ticket hero-ticket-b absolute top-[58%] left-[9%]"
            floatDuration="9s"
            rotate="3deg"
          />
        )}
        {ticketC && (
          <FloatingTicket
            ticket={ticketC}
            tone="mint"
            className="hero-ticket hero-ticket-c absolute top-[20%] right-[6%]"
            floatDuration="8s"
            rotate="5deg"
          />
        )}
        {ticketD && (
          <FloatingTicket
            ticket={ticketD}
            className="hero-ticket hero-ticket-d absolute top-[60%] right-[9%]"
            floatDuration="10s"
            rotate="-3deg"
          />
        )}
      </div>

      {/* Main content */}
      <div className="hero-content mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pt-20 pb-28 text-center sm:px-6">
        <p className="hero-rise font-mono text-xs tracking-[0.25em] text-emerald uppercase">
          Verified deals on AI tools and SaaS
        </p>

        <h1 className="mt-6 text-display-xl font-bold text-balance">
          {HEADLINE.map(({ word, accent }, i) => (
            <span
              key={i}
              className="inline-block overflow-hidden pb-1 align-bottom"
            >
              <span
                className={`hero-word-inner inline-block will-change-transform ${accent ? "text-emerald" : ""}`}
              >
                {word}
                {i < HEADLINE.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-rise mt-6 max-w-xl text-body-lg text-mint/85">
          Every discount worth having, tested by editors who actually use the
          tools.
        </p>

        {/* Command-style search */}
        <form
          action="/search"
          role="search"
          className="hero-rise mt-9 w-full max-w-xl"
        >
          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg focus-within:shadow-[0_0_0_3px_rgba(30,198,119,0.45),var(--shadow-lg)]">
            <Search
              className="ml-2.5 h-5 w-5 shrink-0 text-ink-subtle"
              aria-hidden="true"
            />
            <label htmlFor="hero-search" className="sr-only">
              Search deals
            </label>
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder={`Search ${couponCount.toLocaleString("en-US")}+ verified deals`}
              className="h-11 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-subtle"
              autoComplete="off"
            />
            <button
              type="submit"
              className="btn-gloss btn-primary press-down inline-flex h-11 shrink-0 items-center rounded-xl px-5 text-sm font-semibold"
            >
              Search
            </button>
          </div>
        </form>

        {/* Animated counters */}
        <dl className="hero-rise mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-sm text-mint/75">
          <div className="flex items-baseline gap-1.5">
            <dt className="sr-only">Active coupons</dt>
            <dd className="text-lg font-bold text-white">
              <CountUp value={couponCount} />
            </dd>
            <span>active coupons</span>
          </div>
          <span aria-hidden="true" className="text-white/25">
            /
          </span>
          <div className="flex items-baseline gap-1.5">
            <dt className="sr-only">Stores</dt>
            <dd className="text-lg font-bold text-white">
              <CountUp value={storeCount} />
            </dd>
            <span>stores</span>
          </div>
          <span aria-hidden="true" className="text-white/25">
            /
          </span>
          <div className="flex items-baseline gap-1.5">
            <dd className="text-white">updated today</dd>
          </div>
        </dl>
      </div>

      {/* Live deals ticker */}
      <div
        className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-pine-900/60 py-3 backdrop-blur-none"
        aria-hidden="true"
      >
        <div className="marquee-track" style={{ "--marquee-duration": "55s" } as React.CSSProperties}>
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {tickerItems.map((item, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="mx-6 inline-flex items-center gap-2.5 font-mono text-xs tracking-wider whitespace-nowrap text-mint/70 uppercase"
                >
                  <span className="font-semibold text-white/85">
                    {item.storeName}
                  </span>
                  {item.discountLabel}
                  {item.isNew && (
                    <span className="rounded-full bg-emerald px-1.5 py-0.5 text-[0.6rem] font-bold text-pine-900">
                      New
                    </span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
