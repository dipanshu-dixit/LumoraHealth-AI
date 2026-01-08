const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  
  // Optimize webpack for better performance
  webpack: (config, { isServer, dev }) => {
    // Reduce memory usage
    config.cache = {
      ...config.cache,
      maxMemoryGenerations: dev ? 5 : 1,
    };

    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
            priority: 20,
          },
          lucideReact: {
            test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
            name: 'lucide-react',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    return config;
  },

  // Ignore build errors for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize images for mobile
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize logging
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-markdown',
    ],
  },

  // Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Headers for better caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimize redirects
  async redirects() {
    return [];
  },

  // Optimize rewrites
  async rewrites() {
    return [];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: "lumora-health",
  project: "lumora-frontend",
  hideSourceMaps: true,
  disableLogger: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  }
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);