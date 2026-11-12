import type { NextConfig } from "next";

const gatewayUrl = process.env.API_GATEWAY_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /**
   * The browser talks to the API gateway through this same origin (/api/v1/*).
   * Session cookies are therefore first-party, are visible to middleware.tsx for
   * route protection, and no CORS preflight is needed in production.
   */
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${gatewayUrl}/api/v1/:path*` }];
  },
};

export default nextConfig;
