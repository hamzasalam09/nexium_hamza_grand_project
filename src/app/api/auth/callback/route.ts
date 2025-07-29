import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error_code = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  console.log('Auth callback received:', { 
    code: code ? 'present' : 'missing', 
    error_code, 
    error_description,
    url: request.url 
  });

  // Handle authentication errors
  if (error_code) {
    console.error('Auth callback error:', error_code, error_description);
    return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
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
        console.error('Session exchange error:', error.message);
        return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
      }

      if (data?.session) {
        console.log('Session exchange successful, user:', data.user?.email);
        // Always redirect to production domain for magic links
        const productionUrl = 'https://nexium-hamza-grand-project.vercel.app';
        return NextResponse.redirect(`${productionUrl}${next}`);
      } else {
        console.error('No session data received');
        return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
      }
    } catch (error) {
      console.error('Callback processing error:', error);
      return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
    }
  }

  console.log('No code parameter found in callback');
  // return the user to an error page with instructions
  return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
} 