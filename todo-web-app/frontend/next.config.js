/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias["@"] = __dirname;
    return config;
  },
};

module.exports = nextConfig;
