import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost", "127.0.0.1", "libelit-docs.s3.amazonaws.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "libelit-docs.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "83",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "83",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
