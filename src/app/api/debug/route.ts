import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_COHERE_API_KEY: process.env.NEXT_PUBLIC_COHERE_API_KEY ? 'SET' : 'NOT SET',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    ENABLE_DATABASE: process.env.ENABLE_DATABASE || 'NOT SET',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
  };

  // Additional debugging info
  const debugInfo = {
    message: 'Environment Debug Info',
    environment: envVars,
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-vercel-deployment-url': request.headers.get('x-vercel-deployment-url'),
    },
    // Show actual values (first few chars) for debugging
    actualValues: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
        process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...' : 'NOT SET',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 
        process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      MONGODB_URI: process.env.MONGODB_URI ? 
        process.env.MONGODB_URI.substring(0, 15) + '...' : 'NOT SET',
    }
  };

  return NextResponse.json(debugInfo);
}
