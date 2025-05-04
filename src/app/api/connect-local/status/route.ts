// src/app/api/connect-local/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { clientConfigs } from '../route'; // the in-memory map
const JWT_SECRET = process.env.JWT_SECRET!;

async function getCompanyCode(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) throw new Error('Not authenticated');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
  return payload.companyCode as string;
}

export async function GET(req: NextRequest) {
  try {
    const companyCode = await getCompanyCode(req);
    const isConnected = !!clientConfigs[companyCode];
    return NextResponse.json({ connected: isConnected });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}
