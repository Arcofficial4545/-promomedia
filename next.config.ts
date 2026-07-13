import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    // v2 route renames — old URLs must never 404. Explicit 301 (GET-safe
    // permanent) rather than Next's default 308.
    return [
      { source: "/stores", destination: "/tools", statusCode: 301 },
      { source: "/stores/:slug", destination: "/tools/:slug", statusCode: 301 },
      { source: "/coupons", destination: "/deals", statusCode: 301 },
      {
        source: "/how-we-verify",
        destination: "/how-we-review",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
