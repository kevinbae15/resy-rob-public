/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: "/",
        destination: "/access",
        permanent: true
      }
    ]
  }
};

module.exports = nextConfig;
