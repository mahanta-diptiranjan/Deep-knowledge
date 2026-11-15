import type { NextConfig } from "next";

// Personal, single-user app backed by a local SQLite file: every page reads fresh
// data, so we use plain dynamic rendering instead of Cache Components.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
