import type { NextConfig } from "next";

// Источники тайлов карты (Leaflet) и сторонних API, обращения к которым
// разрешены со страницы — используются картой и плеером озвучки.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.basemaps.cartocdn.com https://*.openstreetmap.org",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.basemaps.cartocdn.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // Картинки, аудио и геоданные из /public — содержимое меняется
        // только при выкладке новой версии, так что браузер может
        // спокойно держать их в кэше и не перекачивать каждый раз.
        source: "/:path((?:maps|images|materials|sounds|fonts)/.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
