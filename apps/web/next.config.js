/** @type {import('next').NextConfig} */
const nextConfig = {
  output:
    process.platform === 'win32' && !process.env.CI && !process.env.DOCKER_BUILD
      ? undefined
      : 'standalone',
  reactStrictMode: true,
  poweredByHeader: false, // Security best practice: hide X-Powered-By
};

module.exports = nextConfig;
