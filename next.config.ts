import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOrigins: ["192.168.0.116", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
