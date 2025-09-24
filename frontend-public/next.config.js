/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Enable SWC minifier to address deprecation warning
  // Configure paths for the public frontend
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,
  
  // Webpack configuration for better hot reload
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Improve hot reload performance
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  
  // API routes configuration - proxy specific routes to backend server
  // Exclude NextAuth and frontend-specific API routes from proxying
  async rewrites() {
    return [
      // Proxy specific backend API routes only
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      // Keep frontend API routes local (auth, website-content, etc.)
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