/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack(config) {
    config.module.rules.push(
      {
        // Match files that end in either .js or .mjs and automatically detect the module type
        test: /\.m?js$/,
        type: 'javascript/auto',
      }
    );
    return config;
  },
};

module.exports = nextConfig;
