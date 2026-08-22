/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false, // Security best practice: hide X-Powered-By
};

module.exports = nextConfig;
