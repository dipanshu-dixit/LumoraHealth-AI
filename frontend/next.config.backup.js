const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    config.cache = {
      ...config.cache,
      maxMemoryGenerations: 1,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  org: "lumora-health",
  project: "lumora-frontend",
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);