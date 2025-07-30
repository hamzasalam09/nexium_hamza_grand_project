import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Try different ways to access environment variables
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

  // Test environment variable access in multiple ways
  const testResults = {
    direct_process_env: !!process.env.OPENAI_API_KEY,
    process_env_keys: Object.keys(process.env).filter(key => 
      key.includes('OPENAI') || key.includes('SUPABASE_SERVICE') || key.includes('MONGODB')
    ),
    all_env_keys_count: Object.keys(process.env).length,
    // Check the actual string values
    raw_values: {
      OPENAI_API_KEY: typeof process.env.OPENAI_API_KEY,
      SUPABASE_SERVICE_ROLE_KEY: typeof process.env.SUPABASE_SERVICE_ROLE_KEY,
      MONGODB_URI: typeof process.env.MONGODB_URI,
    },
    // Check if they're empty strings
    empty_string_check: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY === '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY === '',
      MONGODB_URI: process.env.MONGODB_URI === '',
    }
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
    testResults,
    // Show actual values (first few chars) for debugging - only if they exist and aren't empty
    actualValues: {
      SUPABASE_SERVICE_ROLE_KEY: (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0) ? 
        `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}... (length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length})` : `NOT SET (${typeof process.env.SUPABASE_SERVICE_ROLE_KEY})`,
      OPENAI_API_KEY: (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0) ? 
        `${process.env.OPENAI_API_KEY.substring(0, 15)}... (length: ${process.env.OPENAI_API_KEY.length})` : `NOT SET (${typeof process.env.OPENAI_API_KEY})`,
      MONGODB_URI: (process.env.MONGODB_URI && process.env.MONGODB_URI.length > 0) ? 
        `${process.env.MONGODB_URI.substring(0, 25)}... (length: ${process.env.MONGODB_URI.length})` : `NOT SET (${typeof process.env.MONGODB_URI})`,
    }
  };

  return NextResponse.json(debugInfo);
}
