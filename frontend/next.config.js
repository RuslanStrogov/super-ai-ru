/** @type {import('next').NextConfig} */
const nextConfig = {
  // Фронтенд работает на 3000 порту, прокси на бэкенд через API Gateway
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
      },
    ]
  },
  // Настройка изображений — разрешаем загрузку с любых источников для S3
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig