import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.221', '192.168.29.17'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kowvbnoejitiyvqkupcr.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
}

export default nextConfig
