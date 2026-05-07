/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '192.168.5.124', 
    '192.168.5.123', 
    '192.168.5.124:3000', 
    '192.168.5.123:3000',
    'localhost:3000',
    '0.0.0.0:3000'
  ],
}

export default nextConfig
