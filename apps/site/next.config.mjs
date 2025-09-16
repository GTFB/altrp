import i18nPlugin from 'next-intl/plugin'

const withNextIntl = i18nPlugin(
  './i18n.ts'
)
/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    externalDir: true,
    typedRoutes: true,
  },
};

export default withNextIntl(nextConfig)
