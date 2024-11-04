/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/_next/image(.*)", // Match Next.js optimized images
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/seed/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      loader: "raw-loader",
    });
    config.resolve.alias.canvas = false;

    // Important: return the modified config
    return config;
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
