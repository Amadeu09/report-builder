import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // Keep Playwright (native bindings) out of the webpack/Turbopack bundle.
  serverExternalPackages: ['playwright'],
};

export default nextConfig;
