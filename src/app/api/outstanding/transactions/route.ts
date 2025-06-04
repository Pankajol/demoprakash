// app/api/outstanding/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import webpPool from '@/lib/db';

export async function GET(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  const { searchParams } = new URL(req.url);

  // 1. Extract & validate
  const partyCode = searchParams.get('partyCode');    // exact code filter
  const party     = searchParams.get('party');        // name search
  const myTypes   = searchParams.get('myTypes')?.split(',') ?? [];
  const fromDate  = searchParams.get('fromDate')!;
  const toDate    = searchParams.get('toDate')!;

  // 2. Authenticate
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  let payload: any;
  try {
    ({ payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET)));
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // 3. Build WHERE clauses
  const conditions = [
    '(VAmt - AdjAmt) > 0',
    'companyCode = @companyCode',
    'UsrDate BETWEEN @fromDate AND @toDate',
  ];
  const pool = await webpPool;
  const request = pool.request()
    .input('companyCode', payload.companyCode)
    .input('fromDate',   new Date(fromDate))
    .input('toDate',     new Date(toDate));

  if (partyCode) {
    conditions.push('PartyCode = @partyCode');
    request.input('partyCode', partyCode);
  }
 if (party && party !== partyCode) {
  conditions.push('Party LIKE @partyName');
  request.input('partyName', `%${party}%`);
}
  if (myTypes.length) {
    const clauses = myTypes.map((_, i) => `MyType = @type${i}`);
    conditions.push(`(${clauses.join(' OR ')})`);
    myTypes.forEach((t, i) => request.input(`type${i}`, t));
  }

  const sql = `
    SELECT PartyCode, Party, MyType, VNo, UsrDate, VAmt, AdjAmt, (VAmt - AdjAmt) AS OS
    FROM dbo.DailyTransImport
    WHERE ${conditions.join(' AND ')}
    ORDER BY UsrDate, VNo
  `;

  // 4. Execute
  try {
    const result = await request.query(sql);
    return NextResponse.json(result.recordset);
  } catch (err: any) {
    console.error('[OUTSTANDING_TRANSACTIONS_ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}





