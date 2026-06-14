import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pixel-crochet-app",
  assetPrefix: "/pixel-crochet-app/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
