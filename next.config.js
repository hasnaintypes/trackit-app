/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import "./src/env.js";
import { withBetterStack } from "@logtail/next";

/** @type {import("next").NextConfig} */

const config = {};

config.images = {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cdn.dribbble.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "plus.unsplash.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "placehold.co",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "unsplash.com",
      port: "",
      pathname: "/photos/**",
    },
    {
      protocol: "https",
      hostname: "cdn.shadcnstudio.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.pexels.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "randomuser.me",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "www.comarch.com",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "avatar.iran.liara.run",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "ik.imagekit.io",
      port: "",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "api.dicebear.com",
      port: "",
      pathname: "/**",
    },
  ],
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

export default withBetterStack(config);
