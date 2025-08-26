import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'not set',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'not set',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set',
  };

  return NextResponse.json({
    message: 'NextAuth Configuration Check',
    config
  });
}