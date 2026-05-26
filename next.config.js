const development = process.env.NODE_ENV === "development";

const DEFAULT_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: `base-uri 'self';connect-src 'self' blob: https://vitals.vercel-insights.com;default-src 'self';frame-ancestors 'none';frame-src 'self' https:;font-src 'self';form-action 'self';img-src 'self' blob: data:;object-src 'none';script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""};script-src-attr 'none';style-src 'self' 'unsafe-inline';upgrade-insecure-requests`
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin"
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1"
  },
  {
    key: "Referrer-Policy",
    value: "no-referrer"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off"
  },
  {
    key: "X-Download-Options",
    value: "noopen"
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN"
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none"
  },
  {
    key: "X-XSS-Protection",
    value: "0"
  }
];

// Paths that remove Cross-Origin-Resource-Policy (public assets)
const UNSET_CORP_HEADER = {
  key: "Cross-Origin-Resource-Policy",
  value: ""
};

// Paths that set Cross-Origin-Resource-Policy: cross-origin
const CROSS_ORIGIN_CORP_HEADER = {
  key: "Cross-Origin-Resource-Policy",
  value: "cross-origin"
};

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development"
});

/** @type {import('next').NextConfig} */
module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      // Apply default headers to all routes
      {
        source: "/(.*)",
        headers: DEFAULT_HEADERS
      },
      // Remove CORP for sitemaps
      {
        source: "/sitemap-:path*",
        headers: [UNSET_CORP_HEADER]
      },
      // Remove CORP for robots.txt
      {
        source: "/robots.txt",
        headers: [UNSET_CORP_HEADER]
      },
      // Set cross-origin CORP for public assets
      {
        source: "/android-:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/apple-icon:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/apple-touch-icon:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/favicon:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/mstile-:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/opengraph-image.:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/safari-:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/web-app-manifest-:path*",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      },
      {
        source: "/humans.txt",
        headers: [CROSS_ORIGIN_CORP_HEADER]
      }
    ];
  }
});
