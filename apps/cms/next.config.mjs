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
};

export default withNextIntl(nextConfig)
