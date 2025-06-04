'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Extract & validate query params
  const myType   = searchParams.get('myType');
  const rawParty = searchParams.get('party');
  const partyCode = rawParty ? decodeURIComponent(rawParty) : null;
  const fromDate = searchParams.get('fromDate');
  const toDate   = searchParams.get('toDate');

  if (!myType || !fromDate || !toDate) {
    return NextResponse.json(
      { error: 'myType, fromDate, and toDate are required.' },
      { status: 400 }
    );
  }

  // 2. Authenticate & decode JWT
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
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Build dynamic WHERE clause
  const where: string[] = [
    'MyType = @myType',
    'UsrDate BETWEEN @fromDate AND @toDate',
    'companyCode = @companyCode'
  ];
  if (partyCode) {
    where.push('PartyCode = @partyCode');
  }

  const sql = `
    SELECT *
    FROM DailyTransImport
    WHERE ${where.join(' AND ')}
    ORDER BY UsrDate ASC
  `;

  // 4. Bind inputs and execute
  try {
    const pool = await webpPool;
    const reqB = pool.request()
      .input('myType',   myType)
      .input('fromDate', new Date(fromDate))
      .input('toDate',   new Date(toDate))
      .input('companyCode', payload.companyCode);

    if (partyCode) {
      reqB.input('partyCode', partyCode);
    }

    const result = await reqB.query(sql);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[TRANSACTIONS_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}


