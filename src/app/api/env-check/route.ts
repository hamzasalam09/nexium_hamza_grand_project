import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    OPENAI_API_KEY: {
      exists: !!process.env.OPENAI_API_KEY,
      type: typeof process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0,
      isEmpty: process.env.OPENAI_API_KEY === '',
      isUndefined: process.env.OPENAI_API_KEY === undefined,
      firstChars: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) + '...' : 'N/A'
    },
    env_keys_total: Object.keys(process.env).length,
    openai_related_keys: Object.keys(process.env).filter(key => key.toLowerCase().includes('openai')),
    all_keys_sample: Object.keys(process.env).slice(0, 15),
    vercel_info: {
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    }
  };

  return NextResponse.json(envCheck);
}
