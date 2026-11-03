import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O selo "N" do modo dev cobria os botões de navegação das telas cheias. Erros continuam aparecendo.
  devIndicators: false,
};

export default nextConfig;
