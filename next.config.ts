import type { NextConfig } from "next";

// The base path is only needed for the GitHub Pages deployment.
// In dev it is empty so the app is served at http://localhost:3000.
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
