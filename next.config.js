/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig