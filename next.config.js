/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || "http://localhost:5000/api",
  },
  images: {
    domains: [
      'giaonuocthuduc.com',
      'www.laviewater.com',
      'nuoctinhkhiet.com',
      'nuocsatori.com',
      'sonhawater.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ]
  }
}

module.exports = nextConfig
