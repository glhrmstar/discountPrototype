import type { NextConfig } from "next";

/**
 * Export estático (pasta `out/`) para publicar no GitHub Pages.
 * No Pages o site fica em /<nome-do-repo>; o workflow passa esse caminho em NEXT_PUBLIC_BASE_PATH.
 * Localmente fica vazio e o app roda na raiz.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
