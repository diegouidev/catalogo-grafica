import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'cloudgraficarapida.com.br', // <--- ADICIONADO SEU DOMÍNIO
      },
    ],
  },
  // Isso ajuda a evitar problemas de cache em imagens atualizadas recentemente
  httpAgentOptions: {
    keepAlive: false,
  },
};

export default nextConfig;