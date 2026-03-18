/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import "./src/env.js";
import { withBetterStack } from "@logtail/next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */

const config = {};

config.outputFileTracingIncludes = {
  "/api/**": ["./src/lib/email/templates/**"],
};

config.images = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "avatar.iran.liara.run",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "ik.imagekit.io",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "api.dicebear.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "randomuser.me",
      pathname: "/api/portraits/**",
    },
  ],
};

config.headers = async () => [
  {
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Content-Security-Policy",
        value:
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
      },
    ],
  },
];

export default withBundleAnalyzer(withBetterStack(config));
