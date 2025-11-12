const withPWA = require('next-pwa')({
  dest: 'public/pwa',
  customWorkerDir: 'worker'
})
/** @type {import('next').NextConfig} */

const STATIC_EXPORT = process.env.STATIC_EXPORT === 'true'


const nextConfig = {
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
    optimizeCss: false,
    externalDir: true,
    // inlineCss: true,
    // Exclude Cloudflare Pages Functions from tracing/bundle


  },
  //  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

}


if (STATIC_EXPORT) {
  nextConfig.output = 'export'
  nextConfig.trailingSlash = false
  nextConfig.skipTrailingSlashRedirect = true
  nextConfig.distDir = 'dist'
  nextConfig.reactStrictMode = true
}
module.exports = STATIC_EXPORT ? withPWA(nextConfig) : nextConfig
