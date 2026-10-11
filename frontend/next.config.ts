import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export removed — preview phase is done, app is now dynamic.
  // Runs as a Node server (PM2) instead of a static `out/` folder.

images: {
  unoptimized: true,
  remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com" },
  ],
},
};

export default nextConfig;