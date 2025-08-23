/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] }
  },
  // Enable standalone output for better deployment on Render
  output: 'standalone'
};

export default nextConfig;
