import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  // Keep Playwright/Chromium native bindings out of the webpack/Turbopack bundle.
  serverExternalPackages: ['playwright', 'playwright-core', '@sparticuz/chromium'],
};

export default nextConfig;
