import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://ai-career-mentor-behg.onrender.com/:path*", // backend Render URL
      },
    ];
  },
};

export default nextConfig;

