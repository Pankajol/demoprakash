'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const url      = new URL(req.url);
  const usrName  = url.searchParams.get('usrName');
  const usrDateS = url.searchParams.get('usrDate');
  const yearIdS  = url.searchParams.get('yearId');
  const myType   = url.searchParams.get('myType');

  // 1. Validate required query params
  if (!usrName || !usrDateS || !yearIdS || !myType) {
    return NextResponse.json(
      { error: 'usrName, usrDate, yearId, and myType are all required.' },
      { status: 400 }
    );
  }
  const yearId = parseInt(yearIdS, 10);
  if (Number.isNaN(yearId)) {
    return NextResponse.json(
      { error: 'yearId must be a valid integer.' },
      { status: 400 }
    );
  }
  const usrDate = new Date(usrDateS);
  if (isNaN(usrDate.getTime())) {
    return NextResponse.json(
      { error: 'usrDate must be a valid date string.' },
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
  } catch (e) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Query details for this specific transaction set
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('usrName',  usrName)
      .input('usrDate',  usrDate)
      .input('yearId',   yearId)
      .input('myType',   myType)
      .input('companyCode', payload.companyCode);

    const result = await request.query(`
      SELECT
        Id         AS TransactionId,
        UsrName,
        UsrDate,
        MyType,
        VAmt
      FROM DailyTransImport
      WHERE UsrDate    = @usrDate
        AND YearId      = @yearId
        AND UsrName     = @usrName
        AND MyType      = @myType
        AND companyCode = @companyCode
      ORDER BY Id
    `);

    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[DETAILS_FETCH_ERROR]', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}



