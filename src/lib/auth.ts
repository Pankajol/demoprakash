import { jwtVerify, JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface AuthPayload extends JWTPayload {
  type: 'company' | 'user';
  id: string | number;
  companyCode: string;
  username?: string;
}

export async function getAuthPayload(req: NextRequest): Promise<AuthPayload> {
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token) token = req.cookies.get('token')?.value;
  if (!token) throw new Error('Unauthorized: missing token');

  const { payload } = await jwtVerify<AuthPayload>(token, JWT_SECRET);
  if (!payload || typeof payload !== 'object') throw new Error('Invalid token');

  return payload;
}