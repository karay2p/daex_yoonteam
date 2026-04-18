/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zukcaxtkikuecgjkzjjt.supabase.co'],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store, max-age=0' },
      ],
    },
  ],
}
module.exports = nextConfig
