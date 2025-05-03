import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Create a response with a logout message
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the token cookie by setting it to an empty value with an expired maxAge
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  });

  return response;
}
