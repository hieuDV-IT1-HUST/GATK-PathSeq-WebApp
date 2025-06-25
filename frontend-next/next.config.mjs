/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy tới Flask backend
      },
    ];
  },
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://172.23.0.1:3000"
  ],
};

export default nextConfig;
