
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate via JWT cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payload: any;
    try {
      const { payload: userPayload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      payload = userPayload;
      console.log("Decoded JWT Payload:", payload);
    } catch (_e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 2. Parse and validate query params
    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: 'Both fromDate and toDate query parameters are required.' },
        { status: 400 }
      );
    }

    // 3. Execute DB query with WebpCompanyId filter
    const pool = await webpPool;
    const request = pool.request()
      .input('fromDate', new Date(fromDate))
      .input('toDate', new Date(toDate))
      .input('companyCode', payload.companyCode); // Assuming companyCode is stored in the token payload

    const queryText = `
      SELECT 
        MyType,
        COUNT(*) AS Nos,
        SUM(VAmt) AS Net
      FROM DailyTransImport
      WHERE UsrDate BETWEEN @fromDate AND @toDate
        AND companyCode = @companyCode
      GROUP BY MyType
    `;

    const result = await request.query(queryText);
    return NextResponse.json(result.recordset);

  } catch (err: any) {
    console.error('[DATA_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


