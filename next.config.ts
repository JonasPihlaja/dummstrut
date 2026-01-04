import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase to match your MAX_VIDEO_SIZE
    },
  },
};

export default nextConfig;
