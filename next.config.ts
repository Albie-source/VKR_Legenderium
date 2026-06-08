import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
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
