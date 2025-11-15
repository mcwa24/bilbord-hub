/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['drive.google.com', 'www.dropbox.com', 'wetransfer.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Onemogući keširanje za dinamičke stranice
  experimental: {
    isrMemoryCacheSize: 0, // Onemogući ISR cache
  },
}

module.exports = nextConfig

