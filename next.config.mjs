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

// Note: The port 3000 is the default Next.js development port.
// If you use a different port, update the allowedOrigins accordingly
// or use environment variables for configuration.

export default nextConfig;