
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;

  // 1. Authenticate via JWT cookie
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let payload: any;
  try {
    ({ payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    ));
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 2. Query distinct MyTypes for the user's company
  try {
    const pool = await webpPool;
    const result = await pool.request()
      .input('companyCode', payload.companyCode)
      .query(`
        SELECT DISTINCT MyType
        FROM dbo.DailyTransImport
        WHERE (VAmt - AdjAmt) > 0
          AND companyCode = @companyCode
        ORDER BY MyType;
      `);

    const myTypes = result.recordset.map((row: { MyType: string }) => row.MyType);
    return NextResponse.json(myTypes);
  } catch (err: any) {
    console.error('[MYTYPES_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to fetch MyTypes' },
      { status: 500 }
    );
  }
}



