import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOST!,
        port: process.env.NEXT_PUBLIC_IMAGE_PORT,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "oxide-vegetation-managers-sort.trycloudflare.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
