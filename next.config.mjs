/** @type {import('next').NextConfig} */
const nextConfig = {
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