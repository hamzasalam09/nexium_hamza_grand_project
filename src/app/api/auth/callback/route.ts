import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Create a fresh client to handle the session exchange
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Always redirect to production domain for magic links
      const productionUrl = 'https://nexium-hamza-grand-project.vercel.app';
      return NextResponse.redirect(`${productionUrl}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect('https://nexium-hamza-grand-project.vercel.app/auth/auth-code-error');
} 