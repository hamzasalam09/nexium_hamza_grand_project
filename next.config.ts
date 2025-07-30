import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Explicitly expose environment variables
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    ENABLE_DATABASE: process.env.ENABLE_DATABASE,
  },
  webpack: (config) => {
    // Handle canvas issues with mammoth
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default nextConfig;
