/** @type {import('next').NextConfig} */
const nextConfig = {
  //  production (static export)
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'dist',
  }),
  transpilePackages: [],
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  //  
  experimental: {
    // optimizeCss: true, 
    optimizePackageImports: ['lucide-react'],
  },
  //  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
