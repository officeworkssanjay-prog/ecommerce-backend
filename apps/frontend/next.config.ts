import type { NextConfig } from "next";

// Where the Express API runs. The browser only ever talks to this app's own origin:
//   /api/*      -> API (so the login cookie is first-party, and no CORS is needed)
//   /uploads/*  -> uploaded images served by the API
const backendOrigin = process.env.BACKEND_ORIGIN || "http://localhost:5000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendOrigin}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendOrigin}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
