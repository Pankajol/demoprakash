
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Validate required query params
  const partyCodeParam = searchParams.get('partyCode');
  const fromDateParam  = searchParams.get('fromDate');
  const toDateParam    = searchParams.get('toDate');
  const yearIdParam    = searchParams.get('yearId');
  const partyParam     = searchParams.get('party');

  if (!partyCodeParam || !fromDateParam || !toDateParam || !yearIdParam) {
    return NextResponse.json(
      { error: 'Missing required parameters: partyCode, fromDate, toDate, and yearId are required.' },
      { status: 400 }
    );
  }

  const fromDate = new Date(fromDateParam);
  const toDate   = new Date(toDateParam);
  const yearId   = parseInt(yearIdParam, 10);
  const party    = partyParam ? decodeURIComponent(partyParam) : null;

  if (isNaN(yearId)) {
    return NextResponse.json({ error: 'yearId must be a valid integer.' }, { status: 400 });
  }

  // 2. Authenticate via JWT cookie
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

  // 3. Build and execute query
  try {
    const pool = await webpPool;
    const request = pool.request()
      .input('fromDate',  fromDate)
      .input('toDate',    toDate)
      .input('partyCode', decodeURIComponent(partyCodeParam))
      .input('yearId',    yearId)
      .input('companyCode', payload.companyCode);

    if (party) {
      request.input('party', party);
    }

    const sqlQuery = `
      SELECT
        AA.Mytype,
        AA.VNo,
        AA.UsrDate,
        AA.PartyCode,
        AA.Party   AS Type,
        AA.DrTypeId,
        AA.TradingLed AS Ledger,
        CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE 0 END AS DrAmt,
        CASE WHEN AA.DrTypeId = 0 THEN AA.VAmt ELSE 0 END AS CrAmt,
        SUM(CASE WHEN AA.DrTypeId = 1 THEN AA.VAmt ELSE -AA.VAmt END)
          OVER (ORDER BY AA.UsrDate, AA.VNo ROWS UNBOUNDED PRECEDING) AS Bal,
        AA.YearId
      FROM dbo.DailyTransImport AA
      WHERE AA.UsrDate BETWEEN @fromDate AND @toDate
        AND AA.PartyCode = @partyCode
        ${party ? 'AND AA.Party = @party' : ''}
        AND AA.companyCode = @companyCode
        AND AA.YearId = @yearId
      ORDER BY AA.UsrDate, AA.VNo;
    `;

    const result = await request.query(sqlQuery);
    return NextResponse.json(result.recordset);
  } catch (error: any) {
    console.error('[OUTSTANDING_TRANSACTIONS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




