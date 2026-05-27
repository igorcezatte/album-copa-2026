/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
  webpack: (config, { dev }) => {
    // Em dev no Windows, qualquer interrupção mid-write (Defender, queda do
    // dev, troca de branch) deixa o gzip stream do pack file corrompido,
    // gerando warnings "invalid block type" em cascata. Sem compressão a
    // escrita vira atômica — pasta de cache fica maior em disco, mas
    // resiliente. Em build não compensa: a compressão ajuda em CI cold.
    if (dev && config.cache && typeof config.cache === 'object') {
      config.cache.compression = false
    }
    return config
  },
}

export default nextConfig
