/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/POPROB' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/POPROB' : '',
}

module.exports = nextConfig


