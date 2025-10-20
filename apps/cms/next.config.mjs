import i18nPlugin from 'next-intl/plugin'

const withNextIntl = i18nPlugin(
  './i18n.ts'
)
/** @type {import('next').NextConfig} */

const nextConfig = {
  typedRoutes: true,
  experimental: {
    externalDir: true,
  },
  
  webpack: (config, { isServer }) => {
    // Exclude bun:sqlite from webpack bundling
    config.externals = config.externals || [];
    config.externals.push({
      'bun:sqlite': 'bun:sqlite',
    });
    
    return config;
  },
};

export default withNextIntl(nextConfig)
