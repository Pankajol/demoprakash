// next.config.js

const path = require('path');



const nextConfig = {
  reactStrictMode: true,


  experimental: {
    appDir: true,
    turbopack: true,
 
  },
  webpack(config) {
    // Set alias for "~" and "@" to point to the src folder.
    config.resolve.alias['~'] = path.join(__dirname, 'src');
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;
