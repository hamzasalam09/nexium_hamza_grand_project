import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle PDF.js worker files
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
  
  // Allow external packages for PDF.js
  serverExternalPackages: ['pdfjs-dist'],
};

export default nextConfig;
