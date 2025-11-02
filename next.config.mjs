/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.localhost:3000",  // For subdomain testing on localhost
        "rosterbhai.me",
        "*.rosterbhai.me"    // For production subdomains
      ]
    }
  }
};
export default nextConfig;