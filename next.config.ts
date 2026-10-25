import type { NextConfig } from "next";

// Sem Cache Components: as páginas por usuário buscam no GitHub com cache de fetch (revalidate).
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
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
