import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Dynamic Open Graph images: /og?title=...&subtitle=...
 * Solid pine canvas, emerald accent, wordmark — no gradients, no emoji.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Promopedia").slice(0, 120);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 160);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d4029",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 44,
              backgroundColor: "#1ec677",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Promopedia
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 30,
                color: "#ecf9ee",
                opacity: 0.85,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 24, color: "#ecf9ee", opacity: 0.7 }}>
            Verified deals on AI tools and SaaS
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#1ec677",
              color: "#071f15",
              fontSize: 22,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            promopedia
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
