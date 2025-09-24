const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'admin-frontend',
    _next_intl_trailing_slash: 'false',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Output file tracing root to fix workspace warning
  outputFileTracingRoot: __dirname,
};

module.exports = withNextIntl(nextConfig);