/** @type {import('next').NextConfig} */
const { fileURLToPath } = require('url');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    // Configuration for @electric-sql/pglite
    config.module.rules.push({
      test: /\.+(js|jsx|mjs|ts|tsx)$/,
      use: options.defaultLoaders.babel,
      include: require.resolve("@electric-sql/pglite"),
      type: "javascript/auto",
    });

    if (!options.isServer) {
      config.resolve.fallback = { fs: false, module: false, path: false };
    }

    // Existing SQL loader configuration 
    config.module.rules.push({
      test: /\.sql$/,
      use: "raw-loader",
    });
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };

    return config;
  },
  transpilePackages: ["@electric-sql/pglite-repl", "@electric-sql/pglite"],

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
