/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/dashboard',
  assetPrefix: '/dashboard',
  // Mark Stripe as external so it can use workerd-specific code
  serverExternalPackages: ['stripe'],
};

module.exports = nextConfig;
