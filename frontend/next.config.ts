import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Use local backend for development, Render backend for production
    const backendUrl = process.env.NODE_ENV === 'development'
      ? "http://127.0.0.1:3001"
      : "https://ai-career-mentor-behg.onrender.com";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
