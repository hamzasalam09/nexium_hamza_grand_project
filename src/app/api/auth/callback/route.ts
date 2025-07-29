import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error_code = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const type = searchParams.get('type');
  const token_hash = searchParams.get('token_hash');
  const access_token = searchParams.get('access_token');
  const refresh_token = searchParams.get('refresh_token');
  const next = searchParams.get('next') ?? '/';

  // Log all parameters for debugging
  console.log('Auth callback received:', { 
    code: code ? 'present' : 'missing',
    type,
    token_hash: token_hash ? 'present' : 'missing',
    access_token: access_token ? 'present' : 'missing',
    refresh_token: refresh_token ? 'present' : 'missing',
    error_code, 
    error_description,
    url: request.url,
    env_check: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      supabase_anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
    }
  });

  // Handle authentication errors
  if (error_code) {
    console.error('Auth callback error:', error_code, error_description);
    return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=' + encodeURIComponent(error_code));
  }

  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=env_missing');
  }

  if (code) {
    try {
      // Create a fresh client to handle the session exchange
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      console.log('Attempting to exchange code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Session exchange error:', error.message, error.status);
        return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=' + encodeURIComponent(error.message));
      }

      if (data?.session) {
        console.log('Session exchange successful, user:', data.user?.email);
        // Always redirect to production domain for magic links
        const productionUrl = 'https://nexium-hamza-grand-project.vercel.app';
        return NextResponse.redirect(`${productionUrl}${next}`);
      } else {
        console.error('No session data received');
        return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=no_session');
      }
    } catch (error) {
      console.error('Callback processing error:', error);
      return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=' + encodeURIComponent((error as Error).message));
    }
  }

  console.log('No code parameter found in callback');
  // return the user to an error page with instructions
  return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error?error=no_code');
} 