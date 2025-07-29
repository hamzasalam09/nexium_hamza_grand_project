import { NextResponse } from 'next/server';

export async function GET() {
  // This route can be used to handle Supabase magic link callbacks if needed
  // For most cases, Supabase handles the session client-side
  return NextResponse.redirect('/');
} 