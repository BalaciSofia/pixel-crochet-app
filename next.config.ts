import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/pixel-crochet-app" : "",
  assetPrefix: isProd ? "/pixel-crochet-app/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
