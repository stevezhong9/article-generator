import type { NextConfig } from "next";
// Temporarily disable next-intl to fix build issues
// import createNextIntlPlugin from 'next-intl/plugin';
// const withNextIntl = createNextIntlPlugin('./src/i18n/config.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  
  // Disable ESLint and TypeScript checks during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip trailing slash redirect  
  skipTrailingSlashRedirect: true,
  
  // Enable turbopack features
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Headers for security and compliance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Redirects for compliance and SEO
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true
      },
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true
      },
      {
        source: '/cookie-policy',
        destination: '/cookies',
        permanent: true
      },
      {
        source: '/dmca-policy',
        destination: '/dmca',
        permanent: true
      }
    ];
  }
};

// Temporarily export nextConfig directly without next-intl wrapper
export default nextConfig;
// export default withNextIntl(nextConfig);
