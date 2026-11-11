/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "firebase",
    "@firebase/app",
    "@firebase/auth",
    "@firebase/firestore",
    "@firebase/util",
    "@firebase/component",
    "@xyflow/react",
  ],
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Enable standalone output to avoid static export rename errors
  output: "standalone",
};

module.exports = nextConfig;
