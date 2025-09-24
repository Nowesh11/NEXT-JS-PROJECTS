/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  // Configure paths for the public frontend
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,
  
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Backend API server
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'public-frontend',
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;