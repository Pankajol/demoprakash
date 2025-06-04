
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Extract and validate query params
  const myTypesParam = searchParams.get('myTypes');
  const myTypes = myTypesParam ? myTypesParam.split(',') : [];
  const partyCode = searchParams.get('partyCode') ? decodeURIComponent(searchParams.get('partyCode')!) : null;
  const party     = searchParams.get('party') ? decodeURIComponent(searchParams.get('party')!) : null;
  const fromDate  = searchParams.get('fromDate') || '2023-04-01';
  const toDate    = searchParams.get('toDate')   || '2024-03-31';

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

  // 3. Build WHERE clauses
  const conditions: string[] = ['(VAmt - AdjAmt) > 0', 'UsrDate >= @fromDate', 'UsrDate <= @toDate', 'companyCode = @companyCode'];
  const pool = await webpPool;
  const request = pool.request()
    .input('fromDate', new Date(fromDate))
    .input('toDate',   new Date(toDate))
    .input('companyCode', payload.companyCode);

  if (partyCode) {
    conditions.push('PartyCode = @partyCode');
    request.input('partyCode', partyCode);
  }
  if (party) {
    conditions.push('Party LIKE @party');
    request.input('party', party);
  }
  if (myTypes.length) {
    const typeConds = myTypes.map((_, i) => `MyType = @type${i}`);
    conditions.push(`(${typeConds.join(' OR ')})`);
    myTypes.forEach((t, i) => {
      request.input(`type${i}`, t);
    });
  }

  if (myTypesParam) {
  const typeConds = myTypes.map((_, i) => `MyType = @type${i}`);
  conditions.push(`(${typeConds.join(' OR ')})`);
  myTypes.forEach((t, i) => {
    request.input(`type${i}`, t);
  });
}

  const sqlQuery = `
    SELECT DISTINCT PartyCode, Party
    FROM dbo.DailyTransImport
    WHERE ${conditions.join(' AND ')}
    ORDER BY Party
  `;

  // 4. Execute query
  try {
    const result = await request.query(sqlQuery);
    const partyOptions = result.recordset.map((row: { PartyCode: string; Party: string }) => ({
      value: row.PartyCode,
      label: `${row.PartyCode} - ${row.Party}`
    }));

//     const partyOptions = result.recordset.map((row: { PartyCode: string; Party: string }) => ({
//   value: row.PartyCode,
//   label: `${row.Party} - ${row.PartyCode}`
// }));
    return NextResponse.json(partyOptions);
  } catch (err: any) {
    console.error('[OUTSTANDING_PARTY_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch outstanding party data' }, { status: 500 });
  }
}


