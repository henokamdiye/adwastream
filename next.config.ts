import withPWAInit from "@ducanh2912/next-pwa";
import { NextConfig } from "next/dist/server/config";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // https://github.com/payloadcms/payload/issues/12550#issuecomment-2939070941
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
    prefetchInlining: true,
  },
  // Allow child_process (used by the yt-dlp extraction API route)
  serverExternalPackages: [],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // child_process is a built-in Node module — no special config needed
      config.externals = [...(config.externals || [])];
    }
    return config;
  },
};

const pwa = withPWA(nextConfig);

export default pwa;
