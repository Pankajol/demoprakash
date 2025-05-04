import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
  return NextResponse.json({ companyCode: payload.companyCode ?? null, type: payload.type });
}